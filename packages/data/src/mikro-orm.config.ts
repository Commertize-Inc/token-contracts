import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loadEnv } from "@commertize/utils/env";
import "reflect-metadata";
import { User, NewsArticle, PlaidItem, BankAccount, Waitlist } from "./index";

// Load environment variables from monorepo root
// Pass __dirname to help loadEnv find the monorepo root by walking up from packages/data/src
loadEnv(__dirname);

const config: Options<PostgreSqlDriver> = {
	entities: [User, NewsArticle, PlaidItem, BankAccount, Waitlist],
	driver: PostgreSqlDriver,
	connect: true,
	clientUrl: process.env.DATABASE_URL!,
	driverOptions: {
		connection: {
			ssl: {
				rejectUnauthorized: process.env.NODE_ENV !== "production",
			},
		},
	},
	debug: process.env.NODE_ENV !== "production",
	migrations: {
		path: "./migrations",
		pathTs: "./migrations",
	},
};

export default config;
