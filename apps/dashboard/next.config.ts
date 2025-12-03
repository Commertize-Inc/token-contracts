import type { NextConfig } from "next";
import { loadEnv, getMonorepoRoot } from "@commertize/utils";

loadEnv(__dirname);

const monorepoRoot = getMonorepoRoot(__dirname);

const nextConfig: NextConfig = {
	transpilePackages: ["@commertize/ui", "@commertize/utils"],

	serverExternalPackages: [
		// Database drivers (used by MikroORM)
		"better-sqlite3",
		"libsql",
		"oracledb",
		"mysql",
		"mysql2",
		"mariadb",
		"pg",
		"pg-query-stream",

		// MikroORM packages
		"@mikro-orm/core",
		"@mikro-orm/knex",
		"@mikro-orm/postgresql",
		"@mikro-orm/migrations",
		"@mikro-orm/reflection",
	],

	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Provide fallbacks for Node.js built-ins in client bundle
			config.resolve.fallback = {
				...config.resolve.fallback,
				worker_threads: false,
				child_process: false,
				fs: false,
				net: false,
				tls: false,
				dns: false,
				crypto: false,
				stream: false,
				path: false,
				os: false,
				http: false,
				https: false,
				zlib: false,
				querystring: false,
			};
		}

		return config;
	},

	experimental: {
		workerThreads: false,
	},

	turbopack: {
		root: monorepoRoot,
	},

	allowedDevOrigins: [
		"localhost",
		"127.0.0.1",
		"*.replit.dev",
		"*.riker.replit.dev",
	],
};

export default nextConfig;
