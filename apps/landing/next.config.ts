import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

const isDevelopment = process.env.NODE_ENV !== 'production';
const monorepoRoot = path.join(__dirname, '..', '..');

// In development: load from root .env.development
// In production: Next.js automatically loads .env.production from app directory
const envDir = isDevelopment ? monorepoRoot : __dirname;
loadEnvConfig(envDir, false, { error: console.error, info: console.log });

const nextConfig: NextConfig = {
	transpilePackages: ["@commertize/ui"],
	turbopack: {
		root: monorepoRoot,
	},
};

export default nextConfig;
