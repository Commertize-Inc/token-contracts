import { handle } from "hono/vercel";
import app, { initORM } from "../dist/app.js";

export const config = {
	runtime: "nodejs",
};

// Initialize DB at cold start
try {
	console.log("Starting DB initialization...");
	await initORM();
	console.log("DB initialized successfully.");
} catch (error) {
	console.error("Failed to initialize DB:", error);
	// We don't rethrow here to allow the Hono app to still serve (e.g., for health checks or to return 500s instead of crashing the whole process)
}

export default handle(app);
