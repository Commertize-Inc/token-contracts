import { isDevelopment, STAGE } from "@commertize/utils/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

/**
 * Get the Plaid environment base path based on the environment string
 */
export const getPlaidBasePath = (env: string) => {
	const envLower = env.toLowerCase();
	if (envLower === "production") {
		return PlaidEnvironments.production;
	} else if (envLower === "development") {
		return PlaidEnvironments.development;
	}
	return PlaidEnvironments.sandbox; // default to sandbox
};

/**
 * Get the Plaid environment from environment variables
 */
export const getPlaidEnv = () => {
	return process.env.PLAID_ENV || (isDevelopment ? "sandbox" : "production");
};

/**
 * Create a configured Plaid API client
 */
export const createPlaidClient = () => {
	const plaidEnv = getPlaidEnv();
	const basePath = getPlaidBasePath(plaidEnv);

	// Log configuration for debugging (without exposing secrets)

	const configuration = new Configuration({
		basePath,
		baseOptions: {
			headers: {
				"PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
				"PLAID-SECRET": process.env.PLAID_SECRET,
				"Plaid-Version": "2020-09-14",
			},
		},
	});

	return new PlaidApi(configuration);
};

/**
 * Singleton Plaid client instance (lazy initialization)
 */
let plaidClientInstance: PlaidApi | null = null;

/**
 * Get the Plaid client instance (creates on first call)
 *
 * This uses lazy initialization to avoid module-level side effects
 * that can cause issues during Next.js build phase.
 */
export const getPlaidClient = (): PlaidApi => {
	if (!plaidClientInstance) {
		plaidClientInstance = createPlaidClient();
	}
	return plaidClientInstance;
};
