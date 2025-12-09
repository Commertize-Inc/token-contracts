import type { NextConfig } from "next";
import { loadEnv, getMonorepoRoot } from "@commertize/utils/env";

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
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }],
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
		];
	},
	serverExternalPackages: ["@mikro-orm/core", "@mikro-orm/postgresql", "mikro-orm"],
};

export default nextConfig;
