import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";

/**
 * PlaidItem entity represents a connection to a financial institution via Plaid
 * One item = one bank connection, which can contain multiple accounts
 *
 * Example: User links Chase Bank → one PlaidItem with multiple BankAccounts (checking, savings)
 */
@Entity({ tableName: "plaid_item" })
export class PlaidItem {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => User, { deleteRule: "cascade" })
	user!: User;

	// Plaid identifiers
	/** Unique identifier for the item (bank connection) from Plaid. */
	@Property({ type: "string", unique: true, index: true })
	itemId!: string; // Plaid's item_id (unique per bank connection)

	@Property({ type: "string" })
	accessToken!: string; // Stored encrypted - use setAccessToken() and getDecryptedAccessToken()

	// Institution metadata
	/** Plaid institution ID (e.g., "ins_12345"). */
	@Property({ type: "string" })
	institutionId!: string; // Plaid's institution_id

	/** Name of the institution (e.g., "Chase", "Bank of America"). */
	@Property({ type: "string" })
	institutionName!: string; // E.g., "Chase", "Bank of America"

	// Status tracking
	@Property({ type: "string", default: "active" })
	status: string = "active"; // 'active', 'login_required', 'error', 'inactive'

	@Property({ type: "date", nullable: true })
	lastWebhookAt?: Date; // Last time we received a webhook for this item

	@Property({ type: "string", nullable: true })
	errorMessage?: string; // Store last error message for debugging

	// Note: BankAccount owns the relationship via plaidItem foreign key
	// To get accounts: em.find(BankAccount, { plaidItem: this })

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();

	// Encryption helper methods have been removed to prevent server-side dependencies in the shared package.
	// Services must encrypt/decrypt the access token explicitly.
}
