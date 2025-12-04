import { User } from "@/lib/db/entities/User";
import { OnboardingStep } from "@/lib/types/onboarding";
import { getEM } from "@/lib/db/orm";
import { NextRequest, NextResponse } from "next/server";
import { privyClient } from "@/lib/privy/client";
import { getPlaidClient } from "@/lib/plaid/client";

export async function POST(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const { link_session_id } = await request.json();

		console.log("[IDV Status Check] Request:", {
			privyId,
			link_session_id,
			hasTemplateId: !!process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID,
			templateIdLength:
				process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID?.length || 0,
		});

		// If link_session_id is provided, we can use it to look up the verification
		// Otherwise we can look up by client_user_id (privyId)

		// For simplicity, we'll list verifications for the user and get the latest one
		// or use the session ID if provided.

		let verificationStatus;

		const listRequest = {
			client_user_id: privyId,
			template_id: process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID || "",
		};

		console.log("[IDV Status Check] List request:", {
			...listRequest,
			hasTemplateId: !!listRequest.template_id,
		});

		const plaidClient = getPlaidClient();

		if (link_session_id) {
			// Note: Plaid node SDK might not have a direct "get by link session id" for IDV
			// depending on version, but usually we use /identity_verification/get with identity_verification_id
			// OR we list and filter.
			// Actually, the best way is to list by client_user_id and find the match or just take the latest.

			const response = await plaidClient.identityVerificationList(listRequest);

			// Find the one matching the session or just the latest
			const verifications = response.data.identity_verifications;
			// Sort by created_at desc
			verifications.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

			console.log("[IDV Status Check] Found verifications:", {
				count: verifications.length,
				ids: verifications.map((v: any) => v.id),
			});

			if (verifications.length > 0) {
				verificationStatus = verifications[0];
			}
		} else {
			const response = await plaidClient.identityVerificationList(listRequest);
			const verifications = response.data.identity_verifications;
			verifications.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);

			console.log("[IDV Status Check] Found verifications:", {
				count: verifications.length,
				ids: verifications.map((v: any) => v.id),
			});

			if (verifications.length > 0) {
				verificationStatus = verifications[0];
			}
		}

		if (!verificationStatus) {
			return NextResponse.json(
				{ error: "Verification not found" },
				{ status: 404 }
			);
		}

		const em = await getEM();
		let user = await em.findOne(User, { privyId });

		if (!user) {
			user = em.create(User, {
				privyId,
				isKycd: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				onboardingStep: OnboardingStep.KYC,
			});
		}

		// Check if status is 'success' or 'active' (pending)
		// Plaid IDV statuses: 'success', 'failed', 'active'
		if (
			verificationStatus.status === "success" ||
			verificationStatus.status === "active"
		) {
			user.isKycd = true;
			user.kycCompletedAt = new Date();
		}

		user.plaidIdvSessionId = verificationStatus.id; // This is the identity_verification_id

		await em.persistAndFlush(user);

		return NextResponse.json({
			success: true,
			status: verificationStatus.status,
			step: verificationStatus.steps.documentary_verification, // e.g. 'success', 'failed'
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
