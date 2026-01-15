import baseConfig from "./packages/utils/eslint.base.mjs";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	...baseConfig,

	// TypeScript: `no-undef` is a JS rule and will falsely flag TS types (e.g., HTMLSpanElement)
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"no-undef": "off",
		},
	},
];
