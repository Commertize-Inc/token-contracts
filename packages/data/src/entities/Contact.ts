import { Entity, PrimaryKey, Property, Enum, Index } from "@mikro-orm/core";
import { v4 } from "uuid";

export enum ContactType {
	INVESTOR = "investor",
	SPONSOR = "sponsor",
}

/**
 * Entity representing a contact inquiry.
 * capturing interest from potential investors or sponsors.
 */
@Entity({ tableName: "contact" })
export class Contact {
	@PrimaryKey()
	id: string = v4();

	@Index()
	@Property({ type: "string" })
	email!: string;

	/** Type of user joining (Investor or Sponsor). */
	@Enum(() => ContactType)
	type!: ContactType;

	// Common fields
	@Property({ type: "string", nullable: true })
	phone?: string;

	// Investor specific
	@Property({ type: "string", nullable: true })
	country?: string;

	@Property({ type: "string", nullable: true })
	city?: string;

	@Property({ type: "string", nullable: true })
	investmentAmount?: string;

	@Property({ type: "string", nullable: true })
	investmentTimeframe?: string;

	@Property({ type: "string", nullable: true })
	propertyTypes?: string;

	@Property({ type: "string", nullable: true })
	experience?: string;

	// Sponsor specific
	@Property({ type: "string", nullable: true })
	fullName?: string;

	@Property({ type: "string", nullable: true })
	company?: string;

	@Property({ type: "string", nullable: true })
	propertyName?: string;

	@Property({ type: "string", nullable: true })
	propertyLocation?: string;

	@Property({ type: "string", nullable: true })
	assetType?: string;

	@Property({ type: "string", nullable: true })
	estimatedValue?: string;

	@Property({ type: "string", nullable: true })
	capitalNeeded?: string;

	@Property({ type: "string", nullable: true })
	timeline?: string;

	// Common
	@Property({ type: "string", nullable: true })
	hearAboutUs?: string;

	@Property({ type: "text", nullable: true })
	additionalInfo?: string;

	@Property({ type: "text", nullable: true })
	message?: string;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
