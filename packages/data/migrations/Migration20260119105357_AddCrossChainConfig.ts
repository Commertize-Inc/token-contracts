import { Migration } from '@mikro-orm/migrations';

export class Migration20260119105357_AddCrossChainConfig extends Migration {

	override async up(): Promise<void> {
		this.addSql(`alter table "listing" add column "cross_chain_config" jsonb null;`);
	}

	override async down(): Promise<void> {
		this.addSql(`alter table "listing" drop column "cross_chain_config";`);
	}

}
