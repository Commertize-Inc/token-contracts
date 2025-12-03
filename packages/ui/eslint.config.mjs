import rootConfig from "../../eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...rootConfig,
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			// Package-specific overrides can go here
		},
	},
];
