import { Migration } from "@mikro-orm/migrations";

export class Migration20260117041935_SponsorNotifications extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table "notification" add column "sponsor_id" varchar(255) null;`
		);
		this.addSql(
			`alter table "notification" alter column "user_id" type varchar(255) using ("user_id"::varchar(255));`
		);
		this.addSql(
			`alter table "notification" alter column "user_id" drop not null;`
		);
		this.addSql(
			`alter table "notification" add constraint "notification_sponsor_id_foreign" foreign key ("sponsor_id") references "sponsor" ("id") on update cascade on delete cascade;`
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table "notification" drop constraint "notification_sponsor_id_foreign";`
		);

		this.addSql(`alter table "notification" drop column "sponsor_id";`);

		this.addSql(
			`alter table "notification" alter column "user_id" type varchar(255) using ("user_id"::varchar(255));`
		);
		this.addSql(
			`alter table "notification" alter column "user_id" set not null;`
		);
	}
}
