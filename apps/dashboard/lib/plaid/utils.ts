/**
 * Plaid ACH Integration - Utility Functions
 * Helper functions for formatting, validation, and security
 */

import crypto from "crypto";
import type { BankAccount } from "../db/entities/BankAccount";
import type { PlaidItem } from "../db/entities/PlaidItem";
import type {
	BankAccountResponse,
	PlaidItemResponse,
	PlaidWebhookEvent,
} from "./types";

// ============================================
// Formatting Functions
// ============================================

/**
 * Format account mask for display (e.g., "1234" → "••••1234")
 */
export function formatAccountMask(mask: string): string {
	return `••••${mask}`;
}

/**
 * Format account name for display
 * E.g., "Plaid Checking" → "Checking" if institution name is included separately
 */
export function formatAccountName(
	name: string,
	institutionName: string
): string {
	// Remove institution name from account name if present
	const cleanName = name.replace(institutionName, "").trim();
	return cleanName || name;
}

/**
 * Format account type for display (capitalize first letter)
 */
export function formatAccountType(type: string): string {
	return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

// ============================================
// Validation Functions
// ============================================

/**
 * Check if account is verified and active
 */
export function isAccountVerified(account: BankAccount): boolean {
	return account.isVerified && account.status === "active";
}

/**
 * Check if Plaid item is in good standing
 */
export function isItemActive(item: PlaidItem): boolean {
	return item.status === "active";
}

/**
 * Check if item requires re-authentication
 */
export function itemNeedsReauth(item: PlaidItem): boolean {
	return item.status === "login_required";
}

/**
 * Validate webhook signature (HMAC-SHA256)
 */
export function validateWebhookSignature(
	body: string,
	signature: string,
	secret: string
): boolean {
	try {
		const expectedSignature = crypto
			.createHmac("sha256", secret)
			.update(body)
			.digest("hex");

		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature)
		);
	} catch (error) {
		console.error("[Plaid Webhook] Signature validation error:", error);
		return false;
	}
}

// ============================================
// Security & Sanitization Functions
// ============================================

/**
 * Sanitize bank account for API response
 * Removes sensitive data (tokens, full account numbers)
 */
export function sanitizeBankAccount(account: BankAccount): BankAccountResponse {
	return {
		id: account.id,
		accountName: account.accountName,
		accountType: account.accountType,
		accountMask: formatAccountMask(account.accountMask),
		institutionName: account.institutionName,
		isPrimary: account.isPrimary,
		isVerified: account.isVerified,
		status: account.status,
		createdAt: account.createdAt.toISOString(),
		updatedAt: account.updatedAt.toISOString(),
	};
}

/**
 * Sanitize Plaid item for API response
 * Removes access tokens and sensitive data
 */
export function sanitizePlaidItem(
	item: PlaidItem,
	accountCount: number
): PlaidItemResponse {
	return {
		id: item.id,
		institutionName: item.institutionName,
		institutionId: item.institutionId,
		status: item.status,
		accountCount,
		lastWebhookAt: item.lastWebhookAt?.toISOString(),
		errorMessage: item.errorMessage,
		createdAt: item.createdAt.toISOString(),
		updatedAt: item.updatedAt.toISOString(),
	};
}

/**
 * Sanitize log data (remove sensitive information)
 */
export function sanitizeLogData(data: any): any {
	const sensitive = ["access_token", "accessToken", "public_token", "secret"];
	const sanitized = { ...data };

	for (const key of sensitive) {
		if (sanitized[key]) {
			sanitized[key] = "[REDACTED]";
		}
	}

	return sanitized;
}

// ============================================
// Webhook Processing
// ============================================

/**
 * Parse webhook event from request body
 */
export function parseWebhookEvent(body: string | any): PlaidWebhookEvent {
	const event = typeof body === "string" ? JSON.parse(body) : body;

	return {
		webhook_type: event.webhook_type,
		webhook_code: event.webhook_code,
		item_id: event.item_id,
		error: event.error,
		consent_expiration_time: event.consent_expiration_time,
		environment: event.environment,
	};
}

/**
 * Get human-readable status message for webhook event
 */
export function getWebhookStatusMessage(event: PlaidWebhookEvent): string {
	switch (event.webhook_code) {
		case "ITEM_LOGIN_REQUIRED":
			return "Bank account requires re-authentication";
		case "ERROR":
			return (
				event.error?.display_message ||
				"An error occurred with the bank connection"
			);
		case "PENDING_EXPIRATION":
			return "Bank connection will expire soon";
		case "USER_PERMISSION_REVOKED":
			return "User revoked access to bank account";
		case "WEBHOOK_UPDATE_ACKNOWLEDGED":
			return "Webhook URL updated successfully";
		case "DEFAULT_UPDATE":
			return "Bank connection updated";
		case "TRANSACTIONS_REMOVED":
			return "Historical transactions removed";
		default:
			return "Bank connection status changed";
	}
}

// ============================================
// Status Helpers
// ============================================

/**
 * Get status color/variant for UI display
 */
export function getStatusColor(
	status: string
): "success" | "warning" | "error" | "default" {
	switch (status) {
		case "active":
			return "success";
		case "login_required":
			return "warning";
		case "error":
		case "inactive":
			return "error";
		default:
			return "default";
	}
}

/**
 * Get human-readable status text
 */
export function getStatusText(status: string): string {
	switch (status) {
		case "active":
			return "Connected";
		case "login_required":
			return "Re-auth Required";
		case "error":
			return "Error";
		case "inactive":
			return "Disconnected";
		default:
			return "Unknown";
	}
}

// ============================================
// Error Handling
// ============================================

/**
 * Get user-friendly error message from Plaid error
 */
export function getPlaidErrorMessage(error: any): string {
	if (error?.response?.data?.error_message) {
		return error.response.data.error_message;
	}
	if (error?.message) {
		return error.message;
	}
	return "An unexpected error occurred";
}

/**
 * Get display message from Plaid error (user-safe)
 */
export function getPlaidDisplayMessage(error: any): string {
	if (error?.response?.data?.display_message) {
		return error.response.data.display_message;
	}
	return "We encountered an issue connecting to your bank. Please try again.";
}

/**
 * Check if error is a Plaid API error
 */
export function isPlaidError(error: any): boolean {
	return !!(
		error?.response?.data?.error_code || error?.response?.data?.error_type
	);
}

// ============================================
// Account Selection Helpers
// ============================================

/**
 * Get primary account from list, or first account if none marked primary
 */
export function getPrimaryAccount(accounts: BankAccount[]): BankAccount | null {
	if (accounts.length === 0) return null;

	const primary = accounts.find(
		(acc) => acc.isPrimary && acc.status === "active"
	);
	return (
		primary || accounts.find((acc) => acc.status === "active") || accounts[0]
	);
}

/**
 * Sort accounts: primary first, then by created date
 */
export function sortAccounts(accounts: BankAccount[]): BankAccount[] {
	return accounts.sort((a, b) => {
		if (a.isPrimary && !b.isPrimary) return -1;
		if (!a.isPrimary && b.isPrimary) return 1;
		return b.createdAt.getTime() - a.createdAt.getTime();
	});
}

// ============================================
// Data Transformation
// ============================================

/**
 * Transform Plaid account data to our BankAccount format
 */
export function transformPlaidAccount(
	plaidAccount: any,
	institutionName: string
): {
	plaidAccountId: string;
	accountName: string;
	accountType: string;
	accountMask: string;
	institutionName: string;
} {
	return {
		plaidAccountId: plaidAccount.account_id,
		accountName: plaidAccount.name || plaidAccount.official_name || "Account",
		accountType: plaidAccount.subtype || plaidAccount.type || "depository",
		accountMask: plaidAccount.mask || "0000",
		institutionName,
	};
}
