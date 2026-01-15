// Dynamically import server utils to avoid fs dependency issues in client builds
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import "reflect-metadata";
import {
	BankAccount,
	Dividend,
	Investment,
	Investor,
	LegalDocument,
	Listing,
	NewsArticle,
	Notification,
	PlaidItem,
	ReviewComment,
	Sponsor,
	User,
	Waitlist,
} from "./entities";

// Load environment variables dynamically
const configPromise = (async () => {
	const { isDevelopment, loadEnv, getStage } =
		await import("@commertize/utils/server");

	// Load environment variables from monorepo root
	// Pass __dirname to help loadEnv find the monorepo root by walking up from packages/data/src
	console.debug(process.cwd() + "/../..");
	loadEnv(process.cwd() + "/../..");
	console.debug("contextName: ", getStage());

	const config: Options<PostgreSqlDriver> = {
		entities: [
			BankAccount,
			Dividend,
			Investment,
			Investor,
			LegalDocument,
			Listing,
			NewsArticle,
			Notification,
			PlaidItem,
			ReviewComment,
			Sponsor,

			User,

			Waitlist,
		],
		driver: PostgreSqlDriver,
		connect: true,
		clientUrl: process.env.DATABASE_URL!,
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
		debug: isDevelopment,
		migrations: {
			pathTs: "./migrations",
		},
		seeder: {
			pathTs: "./src/seeders",
			glob: "!(*.d).{js,ts}",
			emit: "ts",
			fileName: (className: string) => className,
		},
	};

	return config;
})();

export default configPromise;
