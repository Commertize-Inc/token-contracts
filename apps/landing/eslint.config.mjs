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
		// Override parser options for landing TypeScript files
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
		files: ["**/*.{ts,tsx,js,jsx}"],
		rules: {
			// Disable unescaped entities rule for content-heavy pages
			"react/no-unescaped-entities": "off",
			// Allow require imports for specific cases
			"@typescript-eslint/no-require-imports": "off",
		},
	},
];
