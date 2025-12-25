import { defineConfig } from "tsup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/client.ts",
		"src/server.ts",
		"src/env-server.ts",
	],
	format: ["cjs", "esm"],
	dts: true,
	clean: true,
	loader: {
		".tsx": "tsx",
	},
	esbuildOptions(options) {
		// Explicitly set resolve extensions to include .tsx
		options.resolveExtensions = [".tsx", ".ts", ".jsx", ".js", ".json"];
	},
});
