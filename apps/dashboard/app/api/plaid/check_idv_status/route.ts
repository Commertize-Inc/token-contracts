import { User } from "@commertize/data";
import { KycStatus } from "@/lib/types/onboarding";
import { getEM } from "@/lib/db/orm";
import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getPlaidClient } from "@/lib/plaid/client";
import { IdentityVerificationGetResponse } from "plaid";

export async function POST(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		let link_session_id, identity_verification_id;
		try {
			const body = await request.json();
			link_session_id = body.link_session_id;
			identity_verification_id = body.identity_verification_id;
		} catch (error) {
			// Body might be empty, which is fine as we can use stored values
		}

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			user = em.create(User, {
				privyId,
				createdAt: new Date(),
				updatedAt: new Date(),
				kycStatus: KycStatus.NOT_STARTED,
			});
			await em.persistAndFlush(user);
		}

		if (!link_session_id && !identity_verification_id && user.plaidIdvSessionId) {
			console.log(
				"[IDV Status Check] Using stored verification ID:",
				user.plaidIdvSessionId
			);
			identity_verification_id = user.plaidIdvSessionId;
			// Set link_session_id as well for fallback list filtering logic
			link_session_id = user.plaidIdvSessionId;
		}

		console.log("[IDV Status Check] Request:", {
			privyId,
			link_session_id,
			identity_verification_id,
			hasTemplateId: !!process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID,
			templateIdLength:
				process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID?.length || 0,
		});

		const plaidClient = getPlaidClient();
		let verificationStatus;

		// If we have a specific identity_verification_id, use the get endpoint for more detailed info
		if (identity_verification_id) {
			try {
				const response = await plaidClient.identityVerificationGet({
					identity_verification_id,
				});
				// The response structure may vary - try both possible locations
				verificationStatus =
					(response.data as IdentityVerificationGetResponse);

			} catch (error) {
				console.error("Error fetching specific verification:", error);
			}
		}

		// If we don't have a specific verification or the get failed, list verifications
		if (!verificationStatus) {
			const listRequest = {
				client_user_id: privyId,
				template_id: process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID || "",
			};

			console.log("[IDV Status Check] List request:", {
				...listRequest,
				hasTemplateId: !!listRequest.template_id,
			});

			const response = await plaidClient.identityVerificationList(listRequest);
			const verifications = response.data.identity_verifications;

			if (verifications.length === 0) {
				return NextResponse.json(
					{ error: "Verification not found" },
					{ status: 404 }
				);
			}

			// Sort by created_at desc to get the latest
			verifications.sort(
				(a: any, b: any) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

			// If link_session_id is provided, try to find matching verification
			if (link_session_id) {
				const matchingVerification = verifications.find(
					(v: any) => v.id === link_session_id
				);
				verificationStatus = matchingVerification || verifications[0];
			} else {
				verificationStatus = verifications[0];
			}

			console.log("[IDV Status Check] Found verifications:", {
				count: verifications.length,
				ids: verifications.map((v: any) => v.id),
				selectedId: verificationStatus.id,
				selectedStatus: verificationStatus.status,
			});
		}

		if (!verificationStatus) {
			return NextResponse.json(
				{ error: "Verification not found" },
				{ status: 404 }
			);
		}




		// Check if status is 'success' or 'active' (pending)
		const isSuccessful =
			verificationStatus.status === "success" ||
			verificationStatus.status === "active";

		// Update kycStatus based on Plaid status
		if (verificationStatus.status === "success") {
			user.kycStatus = KycStatus.APPROVED;
		} else if (verificationStatus.status === "failed") {
			user.kycStatus = KycStatus.REJECTED;
		} else if (verificationStatus.status === "active") {
			user.kycStatus = KycStatus.PENDING;
		}

		// Always update the verification ID to track the latest
		user.plaidIdvSessionId = verificationStatus.id;

		await em.persistAndFlush(user);

		// Extract step information safely
		const steps = verificationStatus.steps || {};
		const documentaryVerification = steps.documentary_verification;
		const kycCheck = steps.kyc_check;

		return NextResponse.json({
			success: true,
			status: verificationStatus.status,
			verificationId: verificationStatus.id,
			steps: {
				documentary_verification: documentaryVerification,
				kyc_check: kycCheck,
			},
			userKycStatus: user.kycStatus,
		});
	} catch (error: any) {
		console.error("[IDV Status Check] Error details:", {
			message: error?.message,
			status: error?.response?.status,
			statusText: error?.response?.statusText,
			url: error?.config?.url,
			method: error?.config?.method,
			baseURL: error?.config?.baseURL,
			headers: error?.config?.headers
				? {
					"PLAID-CLIENT-ID": error.config.headers["PLAID-CLIENT-ID"]
						? "[REDACTED]"
						: undefined,
					"PLAID-SECRET": error.config.headers["PLAID-SECRET"]
						? "[REDACTED]"
						: undefined,
				}
				: undefined,
			responseData: error?.response?.data,
			stack: error?.stack,
		});

		// Return more specific error information in development
		const isDevelopment = process.env.NODE_ENV === "development";
		return NextResponse.json(
			{
				error: "Internal server error",
				...(isDevelopment && {
					details: {
						message: error?.message,
						status: error?.response?.status,
						url: error?.config?.url,
					},
				}),
			},
			{ status: error?.response?.status || 500 }
		);
	}
}
