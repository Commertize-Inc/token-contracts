import {
	Entity,
	PrimaryKey,
	Property as MikroProperty,
	ManyToOne,
	Enum,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { Listing } from "./Listing";
import { InvestmentStatus } from "../enums/entities";

@Entity({ tableName: "investment" })
export class Investment {
	/** Unique identifier for the investment transaction. */
	@PrimaryKey()
	id: string = v4();

	/** The Investor who made the purchase. */
	@ManyToOne(() => User)
	user!: User;

	/** The Property being invested in. */
	@ManyToOne(() => Listing)
	property!: Listing;

	/** Amount invested in USDC (stored as decimal string). */
	@MikroProperty({ type: "decimal", precision: 20, scale: 6 })
	amountUsdc!: string; // Decimal strings for monetary values

	/** Number of tokens purchased. */
	@MikroProperty({ type: "integer" })
	tokenCount!: number;

	/** Status of the investment (Pending, Completed, Failed). */
	@Enum({
		items: () => InvestmentStatus,
		index: true,
		default: InvestmentStatus.PENDING,
	})
	status: InvestmentStatus = InvestmentStatus.PENDING;

	/** Blockchain transaction hash for the payment/minting. */
	@MikroProperty({ type: "string", nullable: true })
	transactionHash?: string;

	@MikroProperty({ type: "string", nullable: true })
	signedSubscriptionAgreementUrl?: string;

	@MikroProperty({ type: "date", nullable: true })
	agreedToTermsAt?: Date;

	@MikroProperty({ type: "date" })
	createdAt: Date = new Date();

	@MikroProperty({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
