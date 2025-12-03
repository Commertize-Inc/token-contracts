import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { loadEnv } from "@commertize/utils";
import "reflect-metadata";
import { User } from "./entities/User";
import { NewsArticle } from "./entities/NewsArticle";
import { PlaidItem } from "./entities/PlaidItem";
import { BankAccount } from "./entities/BankAccount";

// Load environment variables with interpolation support
loadEnv(__dirname);

const config: Options<PostgreSqlDriver> = {
        entities: [User, NewsArticle, PlaidItem, BankAccount],
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
