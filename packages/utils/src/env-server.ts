// Server-only utilities (Node.js environment)
// Safe to use process.env and other Node.js APIs

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import * as path from "path";
import * as fs from "fs";

/**
 * Checks if we're running in a production/Vercel environment where env vars are already set
 */
function isProductionEnvironment(): boolean {
	return !!(
		process.env.NODE_ENV === "production" ||
		process.env.VITE_STAGE === "production"
	);
}

/**
 * Finds the monorepo root directory by walking up from process.cwd()
 * looking for definitive marker files (pnpm-workspace.yaml or turbo.json)
 * @returns The monorepo root directory path, or process.cwd() as fallback
 */
function findMonorepoRoot(): string {
	// In production/Vercel, we don't need to find the root (env vars are already set)
	if (isProductionEnvironment()) {
		return process.cwd();
	}

	let currentDir = path.resolve(process.cwd());
	const root = path.parse(currentDir).root;

	// Look for definitive monorepo markers
	const markers = ["pnpm-workspace.yaml", "turbo.json"];

	while (currentDir !== root) {
		for (const marker of markers) {
			if (fs.existsSync(path.join(currentDir, marker))) {
				return currentDir;
			}
		}
		currentDir = path.dirname(currentDir);
	}

	// Fallback to process.cwd() if no root found
	return process.cwd();
}

/**
 * Load environment variables from .env files
 * In production/Vercel: Skips file loading (env vars are already set via Vercel dashboard)
 * In development: Loads from monorepo root in order: .env, .env.{NODE_ENV}, .env.{NODE_ENV}.local
 * Later files override earlier ones, ensuring .local files take precedence
 */
export function loadEnv(cwd?: string): void {
	// In production/Vercel, environment variables are already set - skip file loading
	if (isProductionEnvironment()) {
		return;
	}

	// In development, load from .env files in monorepo root
	const rootDir = cwd || findMonorepoRoot();
	console.log("rootDir: ", rootDir);
	const nodeEnv =
		process.env.VITE_STAGE || process.env.NODE_ENV || "development";

	// #region agent log
	console.log("[DEBUG] loadEnv: Starting", {
		rootDir,
		processCwd: process.cwd(),
		nodeEnv,
		hasDatabaseUrl: !!process.env.DATABASE_URL,
	});
	// #endregion

	// #region agent log
	const logData: {
		nodeEnv: string;
		rootDir: string;
		processCwd: string;
		finalDatabaseUrl?: boolean;
		files: Array<{
			file: string;
			filePath: string;
			exists: boolean;
			override: boolean;
			loaded?: boolean;
			varCount?: number;
			hasDatabaseUrl?: boolean;
		}>;
	} = { nodeEnv, rootDir, processCwd: process.cwd(), files: [] };
	// #endregion

	// Load order: base files first, then .local files last (highest priority)
	// dotenv.config() by default doesn't override, so we load .local files with override: true
	// IMPORTANT: Only load the .local file for the current stage (e.g., .env.preview.local when VITE_STAGE=preview)
	// This prevents .env.development.local from being loaded when VITE_STAGE=preview
	const envFiles = [
		{ path: ".env", override: false },
		{ path: `.env.${nodeEnv}`, override: true },
		{ path: `.env.${nodeEnv}.local`, override: true }, // .local files override everything
	];

	for (const { path: file, override } of envFiles) {
		const filePath = path.resolve(rootDir, file);
		const exists = fs.existsSync(filePath);
		// #region agent log
		logData.files.push({ file, filePath, exists, override });
		// #endregion
		if (exists) {
			const env = dotenv.config({ path: filePath, override });
			if (env.parsed) {
				// dotenv.config() automatically sets process.env, but we expand for variable substitution
				dotenvExpand.expand(env);
				// Explicitly ensure variables are set in process.env (dotenv should do this, but be explicit)
				for (const [key, value] of Object.entries(env.parsed)) {
					if (override || !(key in process.env)) {
						process.env[key] = value as string;
					}
				}
				// #region agent log
				logData.files[logData.files.length - 1].loaded = true;
				logData.files[logData.files.length - 1].varCount = Object.keys(
					env.parsed
				).length;
				// Check if DATABASE_URL was loaded from this file
				if (env.parsed.DATABASE_URL) {
					logData.files[logData.files.length - 1].hasDatabaseUrl = true;
					console.log("[DEBUG] loadEnv: DATABASE_URL loaded from", file);
				}
				// #endregion
			} else if (env.error) {
				// #region agent log
				console.error("[DEBUG] loadEnv: Error loading", file, env.error);
				// #endregion
			}
		}
	}

	// #region agent log
	logData.finalDatabaseUrl = !!process.env.DATABASE_URL;
	console.log("[DEBUG] loadEnv execution:", JSON.stringify(logData, null, 2));
	console.log(
		"[DEBUG] loadEnv: After loading, DATABASE_URL exists:",
		!!process.env.DATABASE_URL
	);
	if (process.env.DATABASE_URL) {
		console.log(
			"[DEBUG] loadEnv: DATABASE_URL value:",
			process.env.DATABASE_URL.substring(0, 20) + "..."
		);
	}
	fetch("http://127.0.0.1:7242/ingest/33a5e0cb-8aef-450e-9dc8-dd37fc55b1ba", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "env-server.ts:loadEnv",
			message: "Environment files loaded",
			data: logData,
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "env-prec",
		}),
	}).catch(() => {});
	// #endregion
}

export function getStage(): string {
	return (
		process.env.VITE_STAGE ||
		process.env.VITE_STAGE ||
		process.env.NODE_ENV ||
		"development"
	);
}

export const STAGE = getStage();
export const isDevelopment = STAGE === "development";
