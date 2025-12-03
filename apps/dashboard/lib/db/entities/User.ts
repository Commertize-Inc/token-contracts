import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class User {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: "string", unique: true, index: true })
	privyId!: string;

	@Property({ type: "string", nullable: true })
	email?: string;

	@Property({ type: "string", nullable: true })
	walletAddress?: string;

	// Plaid Identity Verification (KYC only - not for bank accounts)
	@Property({ type: "string", nullable: true })
	plaidIdvSessionId?: string;

	@Property({ type: "boolean", default: false })
	isKycd: boolean = false;

	@Property({ type: "date", nullable: true })
	kycCompletedAt?: Date;

	// Stripe Integration
	@Property({ type: "string", nullable: true })
	stripeCustomerId?: string;

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
