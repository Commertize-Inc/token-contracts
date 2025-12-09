import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import "reflect-metadata";
import { Waitlist, NewsArticle, User, PlaidItem, BankAccount } from "@commertize/data";
import { config as dotenvConfig } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";

// Load environment variables
const env = dotenvConfig({ path: path.resolve(__dirname, "../../.env") });
expand(env);

const config: Options<PostgreSqlDriver> = {
	entities: [Waitlist, NewsArticle, User, PlaidItem, BankAccount],
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
		path: "./lib/db/migrations",
		pathTs: "./lib/db/migrations",
	},
};

export default config;
