import type { NextConfig } from "next";
import { loadEnv, getMonorepoRoot } from "@commertize/utils";

loadEnv(__dirname);

const monorepoRoot = getMonorepoRoot(__dirname);

const nextConfig: NextConfig = {
	devIndicators: false,
	transpilePackages: ["@commertize/ui", "@commertize/utils"],
	turbopack: {
		root: monorepoRoot,
	},
	allowedDevOrigins: [
		"localhost",
		"127.0.0.1",
		"*.replit.dev",
		"*.riker.replit.dev",
	],
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }],
			},
		];
	},
};

export default nextConfig;
