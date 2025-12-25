import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { PropertySeeder } from "./PropertySeeder";
import { UserSeeder } from "./UserSeeder";

export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		return this.call(em, [UserSeeder, PropertySeeder]);
	}
}
