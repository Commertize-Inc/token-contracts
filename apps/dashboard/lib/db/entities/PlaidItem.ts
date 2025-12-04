import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { encrypt, decrypt } from "../../security/encryption";

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
	@Property({ type: "string", unique: true, index: true })
	itemId!: string; // Plaid's item_id (unique per bank connection)

	@Property({ type: "string" })
	accessToken!: string; // Stored encrypted - use setAccessToken() and getDecryptedAccessToken()

	// Institution metadata
	@Property({ type: "string" })
	institutionId!: string; // Plaid's institution_id

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

	// Encryption helper methods
	/**
	 * Set the access token (automatically encrypts)
	 */
	setAccessToken(plaintext: string): void {
		this.accessToken = encrypt(plaintext);
	}

	/**
	 * Get the decrypted access token
	 * Use this method instead of accessing accessToken directly
	 */
	getDecryptedAccessToken(): string {
		return decrypt(this.accessToken);
	}
}
