import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Ignore patterns
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"**/.next/**",
			"**/out/**",
			"**/.turbo/**",
			"**/coverage/**",
		],
	},

	// TypeScript files - with type-aware linting
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				tsconfigRootDir: __dirname,
				project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				// Node.js globals
				console: "readonly",
				process: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				module: "readonly",
				require: "readonly",
				exports: "readonly",
				Buffer: "readonly",
				NodeJS: "readonly",
				global: "readonly",
				setTimeout: "readonly",
				setInterval: "readonly",
				clearTimeout: "readonly",
				clearInterval: "readonly",
				TextEncoder: "readonly",
				TextDecoder: "readonly",
				crypto: "readonly",
				alert: "readonly",
				confirm: "readonly",
				prompt: "readonly",

				// Browser globals
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				requestAnimationFrame: "readonly",
				localStorage: "readonly",
				sessionStorage: "readonly",
				fetch: "readonly",
				FormData: "readonly",
				Headers: "readonly",
				Request: "readonly",
				Response: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				HTMLElement: "readonly",
				HTMLButtonElement: "readonly",
				HTMLDivElement: "readonly",
				HTMLInputElement: "readonly",
				HTMLTextAreaElement: "readonly",
				HTMLImageElement: "readonly",
				MouseEvent: "readonly",
				Event: "readonly",
				EventTarget: "readonly",
				Node: "readonly",
				Element: "readonly",

				// Standard Web APIs available in Node 20+
				File: "readonly",
				HeadersInit: "readonly",
				Blob: "readonly",
				FormData: "readonly",

				// React globals (for JSX transform)
				React: "readonly",
				JSX: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			react,
			"react-hooks": reactHooks,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			"@typescript-eslint/no-explicit-any": "off",

			// TypeScript specific rules
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					args: "none",
				},
			],
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-require-imports": "off",

			// React specific rules
			"react/react-in-jsx-scope": "off", // Not needed in Next.js
			"react/prop-types": "off", // Using TypeScript for prop validation
			"react/display-name": "off",

			// General rules
			"no-console": "off",
			"no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},

	// Base JavaScript config
	js.configs.recommended,

	// JavaScript files - no TypeScript type checking
	{
		files: ["**/*.{js,mjs,cjs}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				// Node.js globals
				console: "readonly",
				process: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				module: "readonly",
				require: "readonly",
				exports: "readonly",
				Buffer: "readonly",
				NodeJS: "readonly",
				global: "readonly",
				setTimeout: "readonly",
				setInterval: "readonly",
				clearTimeout: "readonly",
				clearInterval: "readonly",
				TextEncoder: "readonly",
				TextDecoder: "readonly",
				crypto: "readonly",
				alert: "readonly",
				confirm: "readonly",
				prompt: "readonly",

				// Browser globals
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				localStorage: "readonly",
				sessionStorage: "readonly",
				fetch: "readonly",
				FormData: "readonly",
				Headers: "readonly",
				Request: "readonly",
				Response: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				HTMLElement: "readonly",
				HTMLButtonElement: "readonly",
				HTMLDivElement: "readonly",
				HTMLInputElement: "readonly",
				HTMLTextAreaElement: "readonly",
				HTMLImageElement: "readonly",
				MouseEvent: "readonly",
				Event: "readonly",
				EventTarget: "readonly",
				Node: "readonly",
				Element: "readonly",

				// React globals (for JSX transform)
				React: "readonly",
				JSX: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			react,
			"react-hooks": reactHooks,
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			// TypeScript specific rules
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-require-imports": "off",

			// React specific rules
			"react/react-in-jsx-scope": "off", // Not needed in Next.js
			"react/prop-types": "off", // Using TypeScript for prop validation
			"react/display-name": "off",

			// General rules
			"no-console": "off",
			"no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},

	// Force disable base no-unused-vars for TS files (overrides js.recommended)
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"no-unused-vars": "off",
		},
	},

	// Prettier config (must be last to override other configs)
	prettierConfig,
];
