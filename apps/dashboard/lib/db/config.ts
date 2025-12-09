import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loadEnv } from "@commertize/utils/env";
import "reflect-metadata";
import { User, NewsArticle, PlaidItem, BankAccount, Waitlist } from "@commertize/data";

// Load environment variables with interpolation support
loadEnv(__dirname);

const config: Options<PostgreSqlDriver> = {
	entities: [User, NewsArticle, PlaidItem, BankAccount, Waitlist],
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

	// Disable dynamic file access for production builds
	// This prevents MikroORM from scanning the filesystem for entities
	discovery: {
		disableDynamicFileAccess: true,
		requireEntitiesArray: true,
	},

	debug: process.env.NODE_ENV !== "production",
	migrations: {
		// path: "./lib/db/migrations",
		pathTs: "./lib/db/migrations",
	},
};

export default config;
