import { Migration } from '@mikro-orm/migrations';

export class Migration20260115173821 extends Migration {

	override async up(): Promise<void> {
		this.addSql(`alter table "waitlist" rename to "contact";`);
		this.addSql(`alter index "waitlist_pkey" rename to "contact_pkey";`);
		this.addSql(`alter index "waitlist_email_index" rename to "contact_email_index";`);
	}

	override async down(): Promise<void> {
		this.addSql(`alter table "contact" rename to "waitlist";`);
		this.addSql(`alter index "contact_pkey" rename to "waitlist_pkey";`);
		this.addSql(`alter index "contact_email_index" rename to "waitlist_email_index";`);
	}

}
