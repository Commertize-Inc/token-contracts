import { Entity, PrimaryKey, Property, Enum, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { EntityType } from "../enums/entities";

/**
 * Entity representing a review comment made by an admin or user.
 * Can be attached to various entities like Listings or Submissions.
 */
@Entity({ tableName: "review_comment" })
export class ReviewComment {
	@PrimaryKey()
	id: string = v4();

	@Enum(() => EntityType)
	entityType!: EntityType;

	@Property({ type: "string" })
	entityId!: string;

	@ManyToOne(() => User)
	author!: User;

	/** Content of the comment. */
	@Property({ type: "text" })
	content!: string;

	/** Whether this comment is visible only to internal admins. */
	@Property({ type: "boolean", default: false })
	isInternal: boolean = false;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
