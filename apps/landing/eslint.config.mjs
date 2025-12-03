import rootConfig from "../../eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
	...rootConfig,
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
