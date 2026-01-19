import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "./User";

@Entity({ tableName: "wallet" })
export class Wallet {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => User)
	user!: User;

	@Property({ type: "string" })
	address!: string;

	@Property({ type: "string" })
	name!: string;

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();

	constructor(user: User, address: string, name: string) {
		this.user = user;
		this.address = address;
		this.name = name;
	}
}
