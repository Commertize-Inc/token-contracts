import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { initORM } from "./db";
import { dbMiddleware } from "./middleware/db";
import { authMiddleware } from "./middleware/auth";
import { apiKeyMiddleware } from "./middleware/apiKey";

export { initORM };

import news from "./routes/news";
import chat from "./routes/chat";
import profile from "./routes/profile";
import listings from "./routes/listings";
import plaid from "./routes/plaid";
import onboarding from "./routes/onboarding";
import admin from "./routes/admin";
import invest from "./routes/invest";
import sponsor from "./routes/sponsor";
import stripe from "./routes/stripe";
import contact from "./routes/contact";
import dividends from "./routes/dividends";
import reviews from "./routes/reviews";
import notifications from "./routes/notifications";
import upload from "./routes/upload";
import aiContent from "./routes/ai-content";
import oracle from "./routes/oracle";

const app = new Hono();

app.use(logger());

const allowedOrigins = [
	process.env.VITE_LANDING_URL || "https://commertize.com",
	process.env.VITE_DASHBOARD_URL || "https://app.commertize.com",
];

const checkOrigin = (origin: string): boolean => {
	if (!origin) return false;
	if (allowedOrigins.includes(origin)) return true;
	// Allow any localhost origin
	if (origin.startsWith("http://localhost:")) return true;
	// Allow Vercel preview URLs and subdomains
	if (origin.endsWith(".commertize.com")) return true;
	if (origin.includes("preview.commertize.com")) return true;
	if (origin.includes("vercel.app")) return true;
	return false;
};

app.use(
	cors({
		origin: (origin) => {
			if (checkOrigin(origin)) return origin;
			return null;
		},
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"x-api-key",
			"x-vercel-protection-bypass",
		],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	})
);

app.use(dbMiddleware);
app.use(apiKeyMiddleware);

const apiRoutes = new Hono();
apiRoutes.route("/plaid", plaid);
apiRoutes.route("/news", news);
apiRoutes.route("/chat", chat);
apiRoutes.route("/profile", profile);
apiRoutes.route("/listings", listings);
apiRoutes.route("/onboarding", onboarding);
apiRoutes.route("/admin", admin);
apiRoutes.route("/invest", invest);
apiRoutes.route("/sponsor", sponsor);
apiRoutes.route("/stripe", stripe);
apiRoutes.route("/contact", contact);
apiRoutes.route("/dividends", dividends);
apiRoutes.route("/reviews", reviews);
apiRoutes.route("/notifications", notifications);
apiRoutes.route("/upload", upload);
apiRoutes.route("/ai-content", aiContent);
apiRoutes.route("/oracle", oracle);

app.route("/", apiRoutes);
app.route("/api", apiRoutes);

app.get("/", (c) => {
	return c.json({ message: "Commertize Backend is running!" });
});

export default app;
