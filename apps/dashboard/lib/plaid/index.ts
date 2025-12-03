/**
 * Plaid ACH Integration Library
 *
 * Complete integration for Plaid bank account linking and ACH payments
 * with Stripe processor support.
 *
 * @example Basic Usage
 * ```ts
 * import { plaidClient, sanitizeBankAccount } from '@/lib/plaid';
 * import type { BankAccountResponse } from '@/lib/plaid';
 *
 * // Use plaidClient to interact with Plaid API
 * const response = await plaidClient.accountsGet({ access_token });
 *
 * // Sanitize account data before sending to client
 * const safeAccount = sanitizeBankAccount(account);
 * ```
 *
 * @example Environment Variables
 * ```env
 * # Required
 * PLAID_CLIENT_ID=your_client_id
 * PLAID_SECRET=your_secret
 * PLAID_ENV=sandbox  # or 'development', 'production'
 *
 * # Optional
 * PLAID_WEBHOOK_SECRET=your_webhook_secret
 * ```
 */

// Client exports
export {
	getPlaidClient,
	createPlaidClient,
	getPlaidBasePath,
	getPlaidEnv,
} from "./client";

// Value exports (enums)
export { CountryCode } from "./types";

// Type exports
export type {
	PlaidLinkTokenRequest,
	PlaidLinkTokenResponse,
	PlaidAccountData,
	PlaidItemData,
	PlaidInstitutionData,
	ExchangePublicTokenRequest,
	ExchangePublicTokenResponse,
	BankAccountResponse,
	PlaidItemResponse,
	StripeProcessorTokenRequest,
	StripeProcessorTokenResponse,
	PlaidWebhookCode,
	PlaidWebhookEvent,
	CreatePlaidItemInput,
	CreateBankAccountInput,
	UpdateBankAccountInput,
	PlaidError,
	ListBankAccountsQuery,
	ListPlaidItemsQuery,
	Products,
	AccountBase,
	AccountType,
	AccountSubtype,
} from "./types";

// Error class export
export { PlaidAPIError } from "./types";

// Utility exports
export {
	// Formatting
	formatAccountMask,
	formatAccountName,
	formatAccountType,

	// Validation
	isAccountVerified,
	isItemActive,
	itemNeedsReauth,
	validateWebhookSignature,

	// Sanitization
	sanitizeBankAccount,
	sanitizePlaidItem,
	sanitizeLogData,

	// Webhook processing
	parseWebhookEvent,
	getWebhookStatusMessage,

	// Status helpers
	getStatusColor,
	getStatusText,

	// Error handling
	getPlaidErrorMessage,
	getPlaidDisplayMessage,
	isPlaidError,

	// Account helpers
	getPrimaryAccount,
	sortAccounts,

	// Data transformation
	transformPlaidAccount,
} from "./utils";
