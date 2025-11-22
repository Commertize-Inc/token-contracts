import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class User {
	@PrimaryKey()
	id: string = v4();

	@Property()
	privyId!: string;

	@Property({ nullable: true })
	email?: string;

	@Property({ nullable: true })
	walletAddress?: string;

	@Property({ nullable: true })
	plaidAccessToken?: string;

	@Property({ nullable: true })
	plaidItemId?: string;

	@Property({ nullable: true })
	plaidIdvSessionId?: string;

	@Property({ default: false })
	isKycd: boolean = false;

	@Property({ nullable: true })
	kycCompletedAt?: Date;

	@Property()
	createdAt: Date = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
