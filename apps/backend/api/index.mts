import { handle } from "hono/vercel";
import app, { initORM } from "../dist/app.js";

export const config = {
	runtime: "nodejs",
};

// Initialize DB at cold start
await initORM();

export default handle(app);
