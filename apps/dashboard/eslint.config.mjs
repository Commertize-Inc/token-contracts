import rootConfig from "../../eslint.config.mjs";
import tsparser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('eslint').Linter.Config[]} */
export default [
	...rootConfig,
	{
		// Override parser options for dashboard TypeScript files
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
		},
	},
	{
		// Plaid integration files - allow any for complex third-party API types
		files: ["**/plaid/**/*.{ts,tsx}", "**/api/plaid/**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
];
