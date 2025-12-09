import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";

// Dynamically require fs to avoid client-side build errors
let fs: any;
if (typeof window === "undefined") {
	fs = require("fs");
}

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
		if (fs && fs.existsSync && fs.existsSync(workspaceFile)) {
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
	if (typeof window !== "undefined") {
		return { parsed: {} };
	}

	const monorepoRoot = getMonorepoRoot(fromPath);

	// Accumulate all parsed variables here to return the final merged result
	let combinedParsed: Record<string, string> = {};

	// Helper to load and expand an env file
	const loadFile = (filePath: string) => {
		if (fs && fs.existsSync && fs.existsSync(filePath)) {
			// override: true ensures that variables from this file overwrite
			// any previously loaded variables in process.env
			const result = dotenv.config({ path: filePath, override: true });
			dotenvExpand.expand(result);

			if (result.parsed) {
				const envCount = Object.keys(result.parsed).length;
				console.log(`[dotenv@${require('dotenv/package.json').version}] injecting env (${envCount}) from ${path.relative(process.cwd(), filePath)} -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops`);
				combinedParsed = { ...combinedParsed, ...result.parsed };
			}
		}
	};

	// 1. Root .env
	loadFile(path.join(monorepoRoot, ".env"));

	// Read NODE_ENV after loading root .env, in case it's defined there
	const mode = process.env.NODE_ENV;

	// 2. Root .env.{NODE_ENV}
	if (mode) {
		loadFile(path.join(monorepoRoot, `.env.${mode}`));
	}

	// 3. App-specific .env
	const appEnvPath = path.join(fromPath, ".env");
	loadFile(appEnvPath);

	// 4. App-specific .env.{NODE_ENV}
	if (mode) {
		loadFile(path.join(fromPath, `.env.${mode}`));
	}

	// Explicitly expand process.env to handle variables injected by the environment (e.g. Vercel)
	// that might be referenced in .env files but not defined there.
	// We pass the combined parsed vars + process.env to ensure everything is expanded correctly relative to the current state.
	dotenvExpand.expand({ parsed: process.env as any });

	return { parsed: combinedParsed };
}
