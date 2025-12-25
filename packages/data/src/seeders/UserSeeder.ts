import { type EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { User } from "../entities/User";
import { KycStatus } from "../enums";

export const COMMERTIZE_ADMIN_ID = "mock-commertize-sponsor";
export const COMMERTIZE_ADMIN_PRIVY_ID = "did:privy:mock-commertize-sponsor";
export const COMMERTIZE_ADMIN: User = {
	id: COMMERTIZE_ADMIN_ID,
	createdAt: new Date(),
	isAdmin: true,
	kycStatus: KycStatus.APPROVED,
	privyId: COMMERTIZE_ADMIN_PRIVY_ID,
	updatedAt: new Date(),
	username: "commertize-sponsor",
};

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const admin = await em.findOne(User, {
			privyId: COMMERTIZE_ADMIN_PRIVY_ID,
		});
		if (!admin) {
			em.create<User>(User, COMMERTIZE_ADMIN);
			em.flush();
		}
	}
}
