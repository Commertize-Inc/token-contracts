import { mikroOrmConfig } from "@commertize/data";
import { loadEnv } from "@commertize/utils/env";
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import "reflect-metadata";

// Load environment variables with interpolation support
// Although mikroOrmConfig loads envs, we load here again to ensure dashboard-specific contexts are handled if they exist
loadEnv(__dirname);

const config: Options<PostgreSqlDriver> = {
	...mikroOrmConfig,

	// Ensure clientUrl is set from the currently loaded environment
	clientUrl: process.env.DATABASE_URL,

	// Disable dynamic file access for production builds
	// This prevents MikroORM from scanning the filesystem for entities
	discovery: {
		disableDynamicFileAccess: true,
		requireEntitiesArray: true,
	},

	// Override specific to dashboard if needed
	debug: process.env.NODE_ENV !== "production",
	migrations: {
		pathTs: "./lib/db/migrations",
	},
};

export default config;
