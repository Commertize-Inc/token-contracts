import { Entity, PrimaryKey, Property, Enum, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { EntityType } from "../enums/entities";

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

	@Property({ type: "text" })
	content!: string;

	@Property({ type: "boolean", default: false })
	isInternal: boolean = false;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
