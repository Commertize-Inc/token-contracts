import {
	Entity,
	PrimaryKey,
	Property,
	Enum,
	Embedded,
	ManyToOne,
	BeforeDelete,
	type EventArgs,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { KycStatus, UserRole } from "../enums/onboarding";
import { Sponsor } from "./Sponsor";
import { Investor } from "./Investor";
import { Wallet } from "./Wallet";
import { Collection, OneToMany } from "@mikro-orm/core";

/**
 * Core user entity representing an account on the platform.
 * Can hold multiple roles (Investor, Sponsor, Admin) and related profiles.
 */
@Entity({ tableName: "user" })
export class User {
	@PrimaryKey()
	id: string = v4();

	constructor() {}

	/** Unique identifier from the authentication provider (Privy). */
	@Property({ type: "string", unique: true, index: true })
	privyId!: string;

	/** Primary role of the user (Investor, Sponsor, etc.). */
	@Enum({ items: () => UserRole, nullable: true })
	role?: UserRole;

	/** Whether the user has administrative privileges. */
	@Property({ type: "boolean", default: false })
	isAdmin: boolean = false;

	@Property({ type: "string", nullable: true })
	email?: string;

	/** Connected cryptocurrency wallet address. */
	@Property({ type: "string", nullable: true })
	walletAddress?: string;

	@Property({ type: "string", nullable: true })
	firstName?: string;

	@Property({ type: "string", nullable: true })
	lastName?: string;

	@Property({ type: "string", nullable: true })
	phoneNumber?: string;

	@Property({ type: "text", nullable: true })
	bio?: string;

	@Property({ type: "string", nullable: true })
	avatarUrl?: string;

	@Property({ type: "string", unique: true, nullable: true })
	username?: string;

	// Plaid Identity Verification (KYC only - not for bank accounts)
	@Property({ type: "string", nullable: true })
	plaidIdvSessionId?: string;

	@Property({ type: "string", nullable: true })
	plaidWatchlistScreeningId?: string;

	@Property({ type: "string", nullable: true })
	plaidWatchlistScreeningStatus?: string;

	@Property({ type: "string", nullable: true })
	countryOfResidence?: string;

	@Property({ type: "date", nullable: true })
	dateOfBirth?: Date;

	@Property({ type: "decimal", precision: 5, scale: 2, nullable: true })
	riskScore?: number; // e.g. from Plaid or internal logic

	// Stripe Integration
	@Property({ type: "string", nullable: true })
	stripeCustomerId?: string;

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();

	@Enum({ items: () => KycStatus, default: KycStatus.NOT_STARTED })
	kycStatus: KycStatus = KycStatus.NOT_STARTED;

	// Sponsor Specific
	@Property({ type: "string", nullable: true })
	jobTitle?: string;

	@ManyToOne(() => Sponsor, { nullable: true })
	sponsor?: Sponsor;

	@Property({ type: "string", nullable: true })
	organizationRole?: string; // e.g. "OWNER", "ADMIN", "MEMBER"

	@Embedded(() => Investor, { prefix: "investor_", nullable: true })
	investor?: Investor;

	@OneToMany(() => Wallet, (wallet) => wallet.user)
	wallets = new Collection<Wallet>(this);

	@BeforeDelete()
	async checkLastSponsorUser(args: EventArgs<User>) {
		if (this.sponsor) {
			const userCount = await args.em.count(User, {
				sponsor: this.sponsor,
			});

			if (userCount === 1) {
				throw new Error("Cannot delete the last user of a sponsor.");
			}
		}
	}
}
