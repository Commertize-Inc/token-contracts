import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Listing } from "./Listing";

/**
 * Represents a dividend distribution for a specific listing.
 * Tracks the amount, date, and status of the payout to investors.
 */
@Entity()
export class Dividend {
	@PrimaryKey()
	id: string = v4();

	/** Amount distributed per share or total distribution amount (context dependent). */
	@Property({ type: "float" })
	amount!: number;

	/** Date when the dividend was distributed. */
	@Property({ type: "date" })
	distributionDate!: Date;

	/** Status of the distribution process. */
	@Property({ type: "string", default: "pending" })
	status!: "pending" | "distributed";

	/** The listing associated with this dividend. */
	@ManyToOne(() => Listing)
	listing!: Listing;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
