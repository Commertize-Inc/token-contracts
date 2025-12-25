import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/app.ts"],
	format: ["esm"],
	clean: true,
	dts: false,
	tsconfig: "./tsconfig.build.json",
	splitting: false,
	noExternal: [],
	external: [/^@commertize\//, /^@mikro-orm\//, "tedious", "sqlite3"],
	skipNodeModulesBundle: true,
	onSuccess: "echo 'Build completed successfully'",
});
