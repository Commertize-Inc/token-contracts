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

	// 1. Load base .env file first to get VITE_STAGE
	// This allows .env to define which stage we are in (e.g. VITE_STAGE=production)
	const baseEnvPath = path.resolve(rootDir, ".env");
	if (fs.existsSync(baseEnvPath)) {
		const env = dotenv.config({ path: baseEnvPath });
		if (env.parsed) {
			dotenvExpand.expand(env);
		}
	}

	const nodeEnv =
		process.env.VITE_STAGE || process.env.NODE_ENV || "development";

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
		if (fs.existsSync(filePath)) {
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
			}
		}
	}
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
