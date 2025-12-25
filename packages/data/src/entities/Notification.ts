import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";

export enum NotificationType {
	INFO = "info",
	SUCCESS = "success",
	WARNING = "warning",
	ERROR = "error",
	ACTION_REQUIRED = "action_required",
}

@Entity({ tableName: "notification" })
export class Notification {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => User)
	user!: User;

	@Property({ type: "string" })
	title!: string;

	@Property({ type: "text" })
	message!: string;

	@Property({ type: "string", default: "info" })
	type: NotificationType = NotificationType.INFO;

	@Property({ type: "boolean", default: false })
	isRead: boolean = false;

	@Property({ type: "string", nullable: true })
	link?: string;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
