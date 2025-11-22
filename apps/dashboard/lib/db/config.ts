import "reflect-metadata";
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { User } from "./entities/User";

const config: Options = {
	entities: [User],
	driver: PostgreSqlDriver,
	dbName: `commertize${process.env.NODE_ENV === "production" ? "" : "-dev"}`,
	clientUrl: process.env.DATABASE_URL,
	debug: process.env.NODE_ENV !== "production",
	migrations: {
		// path: "./lib/db/migrations",
		pathTs: "./lib/db/migrations",
	},
};

export default config;
