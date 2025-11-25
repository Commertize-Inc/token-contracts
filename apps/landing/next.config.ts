import type { NextConfig } from "next";
import { loadEnv, getMonorepoRoot } from "@commertize/utils";

loadEnv(__dirname);

const monorepoRoot = getMonorepoRoot(__dirname);

const nextConfig: NextConfig = {
        transpilePackages: ["@commertize/ui", "@commertize/utils"],
        turbopack: {
                root: monorepoRoot,
        },
        allowedDevOrigins: ["*"],
};

export default nextConfig;
