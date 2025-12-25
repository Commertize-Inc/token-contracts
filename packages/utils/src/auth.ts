import { jwtVerify, createRemoteJWKSet } from "jose";

export async function verifyUserJWT(token: string) {
	try {
		const appId =
			process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID;

		if (!appId) {
			console.error("Missing PRIVY_APP_ID for JWT verification");
			return null;
		}

		const jwks = createRemoteJWKSet(
			new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
		);

		const { payload } = await jwtVerify(token, jwks, {
			issuer: "privy.io",
			audience: appId,
		});

		return payload;
	} catch (error) {
		console.error("JWT Verification failed:", error);
		return null;
	}
}

export function verifyApiKey(key: string, requiredRole: string = "service") {
	// Simple environment-based key check
	if (requiredRole === "admin" && key === process.env.ADMIN_API_KEY)
		return true;
	if (requiredRole === "service" && key === process.env.SERVICE_API_KEY)
		return true;

	// For Landing -> Dashboard communication
	if (key === process.env.DASHBOARD_API_KEY) return true;

	return false;
}
