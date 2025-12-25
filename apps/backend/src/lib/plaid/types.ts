/**
 * Plaid ACH Integration - Type Definitions
 * Complete type safety for Plaid API responses and internal data structures
 */

import type { Products, CountryCode } from "plaid";

// ============================================
// Link Token Types
// ============================================

export interface PlaidLinkTokenRequest {
	userId: string;
	clientName: string;
	products: Products[];
	countryCodes: CountryCode[];
	language?: string;
	webhookUrl?: string;
	redirectUri?: string;
}

export interface PlaidLinkTokenResponse {
	link_token: string;
	expiration: string;
	request_id: string;
}

// ============================================
// Account Types
// ============================================

export interface PlaidAccountData {
	account_id: string;
	name: string;
	official_name?: string;
	type: string;
	subtype: string;
	mask: string;
	balances: {
		available: number | null;
		current: number | null;
		limit: number | null;
		iso_currency_code: string | null;
	};
}

export interface PlaidItemData {
	item_id: string;
	institution_id: string;
	webhook?: string;
	error?: any;
}

export interface PlaidInstitutionData {
	institution_id: string;
	name: string;
	products: string[];
	country_codes: string[];
	logo?: string | null;
	primary_color?: string | null;
	url?: string | null;
}

// ============================================
// Exchange Token Types
// ============================================

export interface ExchangePublicTokenRequest {
	public_token: string;
}

export interface ExchangePublicTokenResponse {
	access_token: string;
	item_id: string;
	request_id: string;
}

// ============================================
// Bank Account Response Types (API)
// ============================================

export interface BankAccountResponse {
	id: string;
	accountName: string;
	accountType: string;
	accountMask: string;
	institutionName: string;
	isPrimary: boolean;
	isVerified: boolean;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface PlaidItemResponse {
	id: string;
	institutionName: string;
	institutionId: string;
	status: string;
	accountCount: number;
	lastWebhookAt?: string;
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
}

// ============================================
// Stripe Integration Types
// ============================================

export interface StripeProcessorTokenRequest {
	accountId: string; // Our BankAccount.id
}

export interface StripeProcessorTokenResponse {
	processorToken: string;
	accountId: string;
}

// ============================================
// Webhook Types
// ============================================

export type PlaidWebhookCode =
	| "ITEM_LOGIN_REQUIRED"
	| "ERROR"
	| "PENDING_EXPIRATION"
	| "USER_PERMISSION_REVOKED"
	| "WEBHOOK_UPDATE_ACKNOWLEDGED"
	| "DEFAULT_UPDATE"
	| "TRANSACTIONS_REMOVED";

export interface PlaidWebhookEvent {
	webhook_type: string;
	webhook_code: PlaidWebhookCode;
	item_id: string;
	error?: {
		error_type: string;
		error_code: string;
		error_message: string;
		display_message: string | null;
	};
	consent_expiration_time?: string;
	environment: "sandbox" | "development" | "production";
}

// ============================================
// Internal Types for Database Operations
// ============================================

export interface CreatePlaidItemInput {
	userId: string;
	itemId: string;
	accessToken: string;
	institutionId: string;
	institutionName: string;
}

export interface CreateBankAccountInput {
	userId: string;
	plaidItemId: string;
	plaidAccountId: string;
	institutionName: string;
	accountName: string;
	accountType: string;
	accountMask: string;
}

export interface UpdateBankAccountInput {
	stripeProcessorToken?: string;
	stripeBankAccountId?: string;
	isPrimary?: boolean;
	status?: string;
}

// ============================================
// Error Types
// ============================================

export interface PlaidError {
	error_type: string;
	error_code: string;
	error_message: string;
	display_message?: string;
	request_id?: string;
	causes?: any[];
	status?: number;
}

export class PlaidAPIError extends Error {
	public readonly errorType: string;
	public readonly errorCode: string;
	public readonly displayMessage?: string;
	public readonly requestId?: string;

	constructor(plaidError: PlaidError) {
		super(plaidError.error_message);
		this.name = "PlaidAPIError";
		this.errorType = plaidError.error_type;
		this.errorCode = plaidError.error_code;
		this.displayMessage = plaidError.display_message;
		this.requestId = plaidError.request_id;
	}
}

// ============================================
// Utility Types
// ============================================

export interface ListBankAccountsQuery {
	userId: string;
	status?: "active" | "inactive" | "error";
	isPrimary?: boolean;
}

export interface ListPlaidItemsQuery {
	userId: string;
	status?: string;
}

// ============================================
// Re-export Plaid SDK types for convenience
// ============================================

export { CountryCode } from "plaid"; // Value export (enum)

export type { Products, AccountBase, AccountType, AccountSubtype } from "plaid";
