import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { privyClient } from "../lib/privy";
import { HonoEnv } from "../types";

// Helper to verify token without response side effects
const verifyToken = async (
	c: any,
	token: string | undefined
): Promise<string | null> => {
	if (!token) return null;
	try {
		const claims = await privyClient.verifyAuthToken(token);
		return claims.userId;
	} catch (error) {
		return null;
	}
};

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	// Try cookie first (migration support), then Bearer header
	let token = getCookie(c, "privy-token");

	if (!token) {
		const authHeader = c.req.header("Authorization");
		if (authHeader?.startsWith("Bearer ")) {
			token = authHeader.substring(7);
		}
	}

	if (!token) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const userId = await verifyToken(c, token);
	if (!userId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	c.set("userId", userId);
	await next();
});

export const optionalAuthMiddleware = createMiddleware<HonoEnv>(
	async (c, next) => {
		// Try cookie first (migration support), then Bearer header
		let token = getCookie(c, "privy-token");

		if (!token) {
			const authHeader = c.req.header("Authorization");
			if (authHeader?.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		if (token) {
			const userId = await verifyToken(c, token);
			if (userId) {
				c.set("userId", userId);
			}
		}

		await next();
	}
);
