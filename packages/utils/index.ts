import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";
import { existsSync } from "fs";

/**
 * Finds the monorepo root by looking for pnpm-workspace.yaml file.
 * Walks up the directory tree until it finds the workspace file.
 *
 * @param fromPath - The path from which to start searching (defaults to __dirname)
 * @returns The absolute path to the monorepo root
 */
export function getMonorepoRoot(fromPath: string = __dirname): string {
	let currentPath = path.resolve(fromPath);

	// Go up max levels to find the monorepo root
	for (let i = 0; i < 5; i++) {
		const workspaceFile = path.join(currentPath, "pnpm-workspace.yaml");
		if (existsSync(workspaceFile)) {
			return currentPath;
		}
		currentPath = path.dirname(currentPath);
	}

	// Fallback: if workspace file not found, assume we are in the monorepo root
	return fromPath;
}

/**
 * Loads environment variables with a cascading strategy:
 * 1. Loads from monorepo root .env (base configuration)
 * 2. Optionally overrides with app-specific .env (if it exists)
 *
 * This allows you to:
 * - Keep shared configuration in the root .env
 * - Override specific variables per app by creating apps/[app-name]/.env
 *
 * Both files support variable interpolation via dotenv-expand.
 *
 * @param fromPath - The path from which to resolve paths (typically __dirname from next.config.ts)
 * @returns The parsed environment variables from the final merged configuration
 *
 * @example
 * // In apps/dashboard/next.config.ts
 * loadEnv(__dirname); // Loads root .env, then apps/dashboard/.env if it exists
 */
export function loadEnv(
	fromPath: string = __dirname
): dotenv.DotenvConfigOutput {
	const monorepoRoot = getMonorepoRoot(fromPath);

	// 1. Load root .env file (base configuration)
	const rootEnvPath = path.join(monorepoRoot, ".env");
	const rootEnv = dotenv.config({ path: rootEnvPath });
	dotenvExpand.expand(rootEnv);

	let result = rootEnv;

	// 2. Check for app-specific .env override
	// fromPath is typically the app directory (e.g., apps/dashboard)
	const appEnvPath = path.join(fromPath, ".env");

	if (process.env.NODE_ENV == "production" && existsSync(appEnvPath)) {
		// Load app-specific .env, which will override root values
		const appEnv = dotenv.config({ path: appEnvPath });
		dotenvExpand.expand(appEnv);

		// Use the app-specific config (which has overridden process.env)
		result = appEnv;
	}

	// Explicitly expand process.env to handle variables injected by the environment (e.g. Vercel)
	// that might be referenced in .env files but not defined there.
	if (result.parsed) {
		dotenvExpand.expand({ parsed: process.env as any });
	}

	return result;
}
