import type { NextConfig } from "next";
import { loadEnv, getMonorepoRoot } from "@commertize/utils";

// Load .env from monorepo root with variable interpolation support
loadEnv(__dirname);

const monorepoRoot = getMonorepoRoot(__dirname);

const nextConfig: NextConfig = {
	transpilePackages: ["@commertize/ui", "@commertize/utils"],
	turbopack: {
		root: monorepoRoot,
	},
};

export default nextConfig;
