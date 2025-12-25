import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/app.ts"],
	format: ["esm"],
	clean: true,
	dts: true,
	splitting: false,
	noExternal: [/(^@commertize\/)/],
	external: ["tedious", "sqlite3"],
});
