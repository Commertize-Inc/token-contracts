import { isDevelopment, loadEnv } from "@commertize/utils/server";
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as path from "path";
import "reflect-metadata";
import {
	User,
	NewsArticle,
	PlaidItem,
	BankAccount,
	Waitlist,
	Listing,
	Investment,
	LegalDocument,
	ReviewComment,
	Notification,
	Sponsor,
	Investor,
} from "@commertize/data";

// Load environment variables from monorepo root
loadEnv(path.resolve(import.meta.dirname, "../../.."));

const config: Options<PostgreSqlDriver> = {
	entities: [
		User,
		NewsArticle,
		PlaidItem,
		BankAccount,
		Waitlist,
		Listing,
		Investment,
		LegalDocument,
		ReviewComment,
		Notification,
		Sponsor,
		Investor,
	],
	driver: PostgreSqlDriver,
	clientUrl: process.env.DATABASE_URL,
	driverOptions:
		process.env.DATABASE_URL?.includes("localhost") ||
		process.env.DATABASE_URL?.includes("127.0.0.1")
			? undefined
			: {
					connection: {
						ssl: {
							rejectUnauthorized: !isDevelopment,
						},
					},
				},
	// Backend service runs as a persistent node process, so dynamic access is fine for dev,
	// but strictly typed entities are safer.
	discovery: {
		disableDynamicFileAccess: true,
		requireEntitiesArray: true,
	},

	debug: isDevelopment,
};

export default config;
