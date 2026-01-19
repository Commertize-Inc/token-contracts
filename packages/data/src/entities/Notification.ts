import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";
import { Sponsor } from "./Sponsor";

export enum NotificationType {
	INFO = "info",
	SUCCESS = "success",
	WARNING = "warning",
	ERROR = "error",
	ACTION_REQUIRED = "action_required",
	SPONSOR_UPDATE = "sponsor_update",
	SPONSOR_DELETE_REQUEST = "sponsor_delete_request",
}

/**
 * Entity representing a system notification for a user.
 */
@Entity({ tableName: "notification" })
export class Notification {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => User, { deleteRule: "cascade", nullable: true })
	user?: User;

	@ManyToOne(() => Sponsor, { deleteRule: "cascade", nullable: true })
	sponsor?: Sponsor;

	/** Title of the notification. */
	@Property({ type: "string" })
	title!: string;

	/** Body content of the notification. */
	@Property({ type: "text" })
	message!: string;

	@Property({ type: "string", default: "info" })
	type: NotificationType = NotificationType.INFO;

	@Property({ type: "boolean", default: false })
	isRead: boolean = false;

	@Property({ type: "string", nullable: true })
	link?: string;

	@Property({ type: "jsonb", nullable: true })
	metadata?: any;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
