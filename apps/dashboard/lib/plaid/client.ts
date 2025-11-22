import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

/**
 * Get the Plaid environment base path based on the environment string
 */
export const getPlaidBasePath = (env: string) => {
	const envLower = env.toLowerCase();
	if (envLower === 'production') {
		return PlaidEnvironments.production;
	} else if (envLower === 'development') {
		return PlaidEnvironments.development;
	}
	return PlaidEnvironments.sandbox; // default to sandbox
};

/**
 * Get the Plaid environment from environment variables
 */
export const getPlaidEnv = () => {
	return process.env.PLAID_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox');
};

/**
 * Create a configured Plaid API client
 */
export const createPlaidClient = () => {
	const plaidEnv = getPlaidEnv();
	const basePath = getPlaidBasePath(plaidEnv);

	// Log configuration for debugging (without exposing secrets)
	console.log('[Plaid Client] Configuration:', {
		environment: plaidEnv,
		basePath,
		hasClientId: !!process.env.PLAID_CLIENT_ID,
		hasSecret: !!process.env.PLAID_SECRET,
		clientIdLength: process.env.PLAID_CLIENT_ID?.length || 0,
		secretLength: process.env.PLAID_SECRET?.length || 0,
		nodeEnv: process.env.NODE_ENV,
	});

	const configuration = new Configuration({
		basePath,
		baseOptions: {
			headers: {
				'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
				'PLAID-SECRET': process.env.PLAID_SECRET,
				'Plaid-Version': '2020-09-14',
			},
		},
	});

	return new PlaidApi(configuration);
};

/**
 * Singleton Plaid client instance
 */
export const plaidClient = createPlaidClient();
