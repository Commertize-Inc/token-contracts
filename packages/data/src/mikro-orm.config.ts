// Dynamically import server utils to avoid fs dependency issues in client builds
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import "reflect-metadata";
import { BankAccount } from "./entities/BankAccount";
import { Investment } from "./entities/Investment";
import { Investor } from "./entities/Investor";
import { LegalDocument } from "./entities/LegalDocument";
import { Listing } from "./entities/Listing";
import { NewsArticle } from "./entities/NewsArticle";
import { Notification } from "./entities/Notification";
import { PlaidItem } from "./entities/PlaidItem";
import { ReviewComment } from "./entities/ReviewComment";
import { Sponsor } from "./entities/Sponsor";
import { SponsorUpdateRequest } from "./entities/SponsorUpdateRequest";
import { User } from "./entities/User";
import { Waitlist } from "./entities/Waitlist";

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
			User,
			NewsArticle,
			PlaidItem,
			BankAccount,
			Waitlist,
			Listing,
			Investment,
			LegalDocument,
			Investor,
			Sponsor,
			ReviewComment,
			SponsorUpdateRequest,
			Notification,
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
