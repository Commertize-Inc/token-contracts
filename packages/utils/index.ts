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

	while (currentPath !== path.dirname(currentPath)) {
		const workspaceFile = path.join(currentPath, 'pnpm-workspace.yaml');
		if (existsSync(workspaceFile)) {
			return currentPath;
		}
		currentPath = path.dirname(currentPath);
	}

	// Fallback: if workspace file not found, go up two levels from packages/utils
	// This handles the case where the function is called from packages/utils itself
	return path.join(fromPath, '..', '..');
}

/**
 * Loads environment variables from the monorepo root with interpolation support.
 * This function should be called early in the application lifecycle (e.g., in next.config.ts).
 *
 * @param fromPath - The path from which to resolve the monorepo root (defaults to __dirname)
 * @returns The parsed environment variables
 */
export function loadEnv(fromPath: string = __dirname): dotenv.DotenvConfigOutput {
	const monorepoRoot = getMonorepoRoot(fromPath);
	const envPath = path.join(monorepoRoot, '.env');
	const myEnv = dotenv.config({ path: envPath });
	dotenvExpand.expand(myEnv);
	return myEnv;
}
