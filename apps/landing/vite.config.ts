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
			env.VITE_LANDING_URL
			? parseInt(env.VITE_LANDING_URL.split(":").pop() || "3000")
			: 3000;

	return {
		plugins: [react(), tsconfigPaths()],
		envDir,
		server: {
			port,
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		optimizeDeps: {
			exclude: ["@commertize/backend", "@commertize/data"],
		},
	};
});
