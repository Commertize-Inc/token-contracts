import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loadEnv } from "@commertize/utils/env";
import "reflect-metadata";
import { User, NewsArticle, PlaidItem, BankAccount, Waitlist } from "./index";

// Load environment variables
loadEnv();

const config: Options<PostgreSqlDriver> = {
	entities: [User, NewsArticle, PlaidItem, BankAccount, Waitlist],
	driver: PostgreSqlDriver,
	connect: true,
	clientUrl: process.env.DATABASE_URL,
	driverOptions: {
		connection: {
			ssl: {
				rejectUnauthorized: false,
			},
		},
	},
	debug: process.env.NODE_ENV !== "production",
	migrations: {
		path: "./src/migrations",
		pathTs: "./src/migrations",
	},
};

export default config;
