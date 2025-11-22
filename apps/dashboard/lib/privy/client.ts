import { PrivyClient } from "@privy-io/server-auth";

/**
 * Create a configured Privy client
 */
export const createPrivyClient = () => {
	return new PrivyClient(
		process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
		process.env.PRIVY_APP_SECRET || ""
	);
};

/**
 * Singleton Privy client instance
 */
export const privyClient = createPrivyClient();
