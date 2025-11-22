import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loadEnvConfig } from "@next/env";
import path from "path";
import "reflect-metadata";
import { User } from "./entities/User";

// Load environment variables using the same approach as next.config.ts
const isDevelopment = process.env.NODE_ENV !== 'production';
const monorepoRoot = path.join(__dirname, '..', '..', '..', '..');
const envDir = isDevelopment ? monorepoRoot : path.join(__dirname, '..', '..');
loadEnvConfig(envDir, false, { error: console.error, info: console.log }, true);

const config: Options<PostgreSqlDriver> = {
	entities: [User],
	driver: PostgreSqlDriver,
	connect: true,

	clientUrl: process.env.DATABASE_URL,

	// SSL configuration for NeonDB
	driverOptions: {
		connection: {
			ssl: {
				rejectUnauthorized: false, // Required for NeonDB
			},
		},
	},

	debug: process.env.NODE_ENV !== "production",
	migrations: {
		// path: "./lib/db/migrations",
		pathTs: "./lib/db/migrations",
	},
};

export default config;
