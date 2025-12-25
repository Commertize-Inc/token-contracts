import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ mode }) => {
	const envDir = path.resolve(__dirname, "../../");
	const env = loadEnv(mode, envDir, "");
	const port =
		env.NODE_ENV === "development" &&
		(env.VITE_STAGE === "local" || env.VITE_STAGE === "development") &&
		env.VITE_DASHBOARD_URL
			? parseInt(env.VITE_DASHBOARD_URL.split(":").pop() || "3001")
			: 3001;

	return {
		plugins: [react(), tsconfigPaths()],
		envDir,
		server: {
			port,
			proxy: {
				"/api": {
					target: process.env.VITE_API_URL || "http://localhost:3002",
					changeOrigin: true,
				},
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
			// Prioritize browser-compatible exports from packages
			conditions: ["browser", "module", "import", "default"],
		},
		optimizeDeps: {
			exclude: ["@commertize/backend", "@commertize/data", "@commertize/ui"],
			esbuildOptions: {
				define: {
					global: "globalThis",
				},
			},
		},
		build: {
			commonjsOptions: {
				transformMixedEsModules: true,
			},
		},
	};
});
