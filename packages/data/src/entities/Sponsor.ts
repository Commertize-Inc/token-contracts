import {
	Entity,
	Property,
	Enum,
	PrimaryKey,
	OneToMany,
	Collection,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { Listing } from "./Listing";

import { VerificationStatus } from "../enums/onboarding";

/**
 * Entity representing a sponsor (company or individual) listing properties.
 * Contains business details, verification status, and relationships to members/listings.
 */
@Entity({ tableName: "sponsor" })
export class Sponsor {
	@PrimaryKey()
	id: string = v4();

	/** Legal business name of the sponsor. */
	@Property({ type: "string" })
	businessName!: string;

	/** Employer Identification Number (EIN) or tax ID. */
	@Property({ type: "string", nullable: true })
	ein?: string;

	/** Physical or mailing address. */
	@Property({ type: "string", nullable: true })
	address?: string;

	/** Brief biography or description of the sponsor. */
	@Property({ type: "text", nullable: true })
	bio?: string;

	/** KYB (Know Your Business) verification status. */
	@Enum({
		items: () => VerificationStatus,
		default: VerificationStatus.UNVERIFIED,
	})
	status: VerificationStatus = VerificationStatus.UNVERIFIED;

	/** Raw KYB data returned from the verification provider (e.g., Middesk, Persona). */
	@Property({ type: "json", nullable: true })
	kybData?: any;

	/** List of IDs of users who are voting members/owners. */
	@Property({ type: "json" })
	votingMembers: string[] = [];

	@OneToMany(() => User, (user) => user.sponsor)
	members = new Collection<User>(this);

	@OneToMany(() => Listing, (listing) => listing.sponsor)
	listings = new Collection<Listing>(this);



	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
