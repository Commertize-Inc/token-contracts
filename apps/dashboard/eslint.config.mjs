import rootConfig from "../../eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...rootConfig,
	{
		// Plaid integration files - allow any for complex third-party API types
		files: ["**/plaid/**/*.{ts,tsx}", "**/api/plaid/**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
];
