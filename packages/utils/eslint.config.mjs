import rootConfig from "../../eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...rootConfig,
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			globals: {
				// Node.js globals for utils package
				global: "readonly",
			},
		},
		rules: {
			// Package-specific overrides can go here
		},
	},
];
