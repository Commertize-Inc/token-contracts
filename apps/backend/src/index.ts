import "reflect-metadata";
import { serve } from "@hono/node-server";
import { loadEnv } from "@commertize/utils/server";
import * as path from "path";

// Load environment variables from monorepo root
loadEnv(path.resolve(import.meta.dirname, "../../.."));

import app from "./app";
import { initORM } from "./db";

const getPort = () => {
	if (process.env.VITE_API_URL) {
		try {
			const url = new URL(process.env.VITE_API_URL);
			if (url.port) return parseInt(url.port);
		} catch {
			// fallback if not a valid URL
		}
		const parts = process.env.VITE_API_URL.split(":");
		if (parts.length > 2) return parseInt(parts[2]); // http: // localhost : 3002
		if (parts.length === 2 && !parts[1].startsWith("//"))
			return parseInt(parts[1]); // localhost:3002
	}
	return 3002;
};

const port = getPort();

// Initialize DB then start server
initORM()
	.then(() => {
		console.log("Database initialized");
		console.log(`Server is running on http://localhost:${port}`);

		serve({
			fetch: app.fetch,
			port,
		});
	})
	.catch((err) => {
		console.error("Failed to initialize database", err);
		process.exit(1);
	});
