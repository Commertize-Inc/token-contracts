import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Listing } from "./Listing";

@Entity()
export class Dividend {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: "float" })
	amount!: number;

	@Property({ type: "date" })
	distributionDate!: Date;

	@Property({ type: "string", default: "pending" })
	status!: "pending" | "distributed";

	@ManyToOne(() => Listing)
	listing!: Listing;

	@Property({ type: "date" })
	createdAt: Date = new Date();
}
