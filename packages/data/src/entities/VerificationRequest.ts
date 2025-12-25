import { Entity, Property, Enum, PrimaryKey, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { VerificationRequestStatus } from "../enums/verification";

/**
 * Abstract base class for verification requests (e.g., identity, acceleration).
 * Stores common fields like status, requestor, and admin notes.
 */
@Entity({ abstract: true })
export abstract class VerificationRequest {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => User)
	requestedBy!: User;

	/** Status of the request (Pending, Approved, Rejected). */
	@Enum({
		items: () => VerificationRequestStatus,
		default: VerificationRequestStatus.PENDING,
	})
	status: VerificationRequestStatus = VerificationRequestStatus.PENDING;

	@Property({ type: "json", nullable: true })
	documents?: string[];

	@Property({ type: "text", nullable: true })
	adminNotes?: string;

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
