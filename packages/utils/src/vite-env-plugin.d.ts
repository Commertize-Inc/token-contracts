import type { Plugin } from "vite";
/**
 * Vite plugin to load environment variables in the correct order:
 * 1. Project root: .env, .env.${stage}, .env.${stage}.local
 * 2. App-specific: .env, .env.${stage}, .env.${stage}.local
 *
 * @param appDir - The app directory (e.g., apps/landing-vite)
 * @param rootDir - The monorepo root directory
 */
export declare function envPlugin(appDir: string, rootDir: string): Plugin;
