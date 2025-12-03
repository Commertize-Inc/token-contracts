import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";

/**
 * BankAccount entity for storing individual bank accounts
 * Multiple accounts can belong to the same PlaidItem (same bank connection)
 *
 * Example: Chase checking and Chase savings both reference the same PlaidItem
 */
@Entity()
export class BankAccount {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => User)
	user!: User;

	@ManyToOne("PlaidItem")
	plaidItem: any;

	// Computed property: Institution name from PlaidItem relation
	// Always ensure plaidItem is populated when querying BankAccount
	get institutionName(): string {
		if (!this.plaidItem) {
			throw new Error(
				"BankAccount.institutionName accessed but plaidItem relation not populated. " +
					'Add { populate: ["plaidItem"] } to your query.'
			);
		}
		return this.plaidItem.institutionName;
	}

	// Setter for TypeScript - makes property settable (but does nothing)
	set institutionName(_value: string) {
		// No-op: institutionName is computed from plaidItem.institutionName
		// This setter exists only for TypeScript compatibility
	}

	// Plaid account identifier
	@Property({ type: "string", unique: true, index: true })
	plaidAccountId!: string; // Unique ID for this specific account

	// Stripe integration
	@Property({ type: "string", nullable: true })
	stripeProcessorToken?: string;

	@Property({ type: "string", nullable: true })
	stripeBankAccountId?: string;

	@Property({ type: "date", nullable: true })
	stripeTokenCreatedAt?: Date; // When the processor token was first created

	@Property({ type: "date", nullable: true })
	stripeTokenLastUsedAt?: Date; // Last time the token was used for a payment

	// Account metadata (cached from Plaid for performance)
	@Property({ type: "string" })
	accountName!: string; // E.g., "Chase Checking", "Savings"

	@Property({ type: "string" })
	accountType!: string; // 'checking', 'savings', 'credit', etc.

	@Property({ type: "string" })
	accountMask!: string; // Last 4 digits (e.g., "1234")

	// Status tracking
	@Property({ type: "boolean", default: true })
	isVerified: boolean = true;

	@Property({ type: "boolean", default: false })
	isPrimary: boolean = false;

	@Property({ type: "string", default: "active", index: true })
	status: string = "active"; // 'active', 'inactive', 'error'

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
