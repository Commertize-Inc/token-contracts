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

@Entity({ tableName: "sponsor" })
export class Sponsor {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: "string" })
	businessName!: string;

	@Property({ type: "string", nullable: true })
	ein?: string;

	@Property({ type: "string", nullable: true })
	address?: string;

	@Property({ type: "text", nullable: true })
	bio?: string;

	@Enum({
		items: () => VerificationStatus,
		default: VerificationStatus.UNVERIFIED,
	})
	status: VerificationStatus = VerificationStatus.UNVERIFIED;

	@Property({ type: "json", nullable: true })
	kybData?: any;

	@Property({ type: "json" })
	votingMembers: string[] = [];

	@OneToMany(() => User, (user) => user.sponsor)
	members = new Collection<User>(this);

	@OneToMany(() => Listing, (listing) => listing.sponsor)
	listings = new Collection<Listing>(this);

	@OneToMany("SponsorUpdateRequest", "sponsor")
	updateRequests = new Collection<any>(this);

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
