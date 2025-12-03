import rootConfig from "../../eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...rootConfig,
	{
		files: ["**/*.{ts,tsx,js,jsx}"],
		languageOptions: {
			globals: {
				// Browser globals for Next.js client components
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
			},
		},
		rules: {
			// Next.js specific overrides
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
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
