import { Migration } from "@mikro-orm/migrations";

export class Migration20260114042203 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table "sponsor_update_request" drop constraint "sponsor_update_request_requested_by_id_foreign";`
		);

		this.addSql(
			`alter table "review_comment" drop constraint "review_comment_author_id_foreign";`
		);

		this.addSql(
			`alter table "notification" drop constraint "notification_user_id_foreign";`
		);

		this.addSql(
			`alter table "investment" drop constraint "investment_user_id_foreign";`
		);

		this.addSql(
			`alter table "sponsor_update_request" add constraint "sponsor_update_request_requested_by_id_foreign" foreign key ("requested_by_id") references "user" ("id") on update cascade on delete cascade;`
		);

		this.addSql(
			`alter table "review_comment" add constraint "review_comment_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade on delete cascade;`
		);

		this.addSql(
			`alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`
		);

		this.addSql(
			`alter table "investment" add constraint "investment_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table "sponsor_update_request" drop constraint "sponsor_update_request_requested_by_id_foreign";`
		);

		this.addSql(
			`alter table "review_comment" drop constraint "review_comment_author_id_foreign";`
		);

		this.addSql(
			`alter table "notification" drop constraint "notification_user_id_foreign";`
		);

		this.addSql(
			`alter table "investment" drop constraint "investment_user_id_foreign";`
		);

		this.addSql(
			`alter table "sponsor_update_request" add constraint "sponsor_update_request_requested_by_id_foreign" foreign key ("requested_by_id") references "user" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "review_comment" add constraint "review_comment_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "investment" add constraint "investment_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
		);
	}
}
