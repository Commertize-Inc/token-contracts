import { NextRequest, NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";
import { privyClient } from "@/lib/privy/client";
import { plaidClient } from "@/lib/plaid/client";

/**
 * Create a Plaid link token
 * @param request - The request object
 * @returns The response object
 */
export async function POST(request: NextRequest) {
	try {
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const requestPayload = {
			user: { client_user_id: privyId },
			client_name: `Commertize-${process.env.NODE_ENV}`,
			products: [Products.IdentityVerification],
			identity_verification: {
				template_id: process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID || '',
			},
			country_codes: [CountryCode.Us],
			language: 'en',
		};

		console.log('[Link Token Create] Request payload:', {
			...requestPayload,
			user: { client_user_id: privyId },
			hasTemplateId: !!process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID,
			templateIdLength: process.env.PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID?.length || 0,
		});

		const response = await plaidClient.linkTokenCreate(requestPayload);

		console.log('[Link Token Create] Success:', {
			hasLinkToken: !!response.data.link_token,
			linkTokenLength: response.data.link_token?.length || 0,
		});

		return NextResponse.json({ link_token: response.data.link_token });
	} catch (error: any) {
		console.error('[Link Token Create] Error details:', {
			message: error?.message,
			status: error?.response?.status,
			statusText: error?.response?.statusText,
			url: error?.config?.url,
			method: error?.config?.method,
			baseURL: error?.config?.baseURL,
			headers: error?.config?.headers ? {
				'PLAID-CLIENT-ID': error.config.headers['PLAID-CLIENT-ID'] ? '[REDACTED]' : undefined,
				'PLAID-SECRET': error.config.headers['PLAID-SECRET'] ? '[REDACTED]' : undefined,
				'Plaid-Version': error.config.headers['Plaid-Version'],
			} : undefined,
			responseData: error?.response?.data,
			stack: error?.stack,
		});

		// Return more specific error information in development
		const isDevelopment = process.env.NODE_ENV === 'development';
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
