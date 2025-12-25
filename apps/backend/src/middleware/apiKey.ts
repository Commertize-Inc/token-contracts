import { createMiddleware } from "hono/factory";

export const apiKeyMiddleware = createMiddleware(async (c, next) => {
	// API key validation is now optional - used only for server-to-server calls
	// Browser clients are protected by CORS + Privy auth on sensitive endpoints
	const apiKey = c.req.header("x-api-key");
	const validApiKey = process.env.API_SECRET_KEY;

	// Set a flag for routes that need to check server-to-server auth
	c.set("isServerCall", !!(apiKey && validApiKey && apiKey === validApiKey));

	await next();
});
