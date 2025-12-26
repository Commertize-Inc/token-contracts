import { Migration } from "@mikro-orm/migrations";

export class Migration20251226021939 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table "sponsor" drop constraint if exists "sponsor_status_check";`
		);

		this.addSql(
			`alter table "user" drop constraint if exists "user_investor_status_check";`
		);

		this.addSql(
			`alter table "sponsor" add constraint "sponsor_status_check" check("status" in ('verified', 'pending', 'unverified', 'rejected', 'NOT_STARTED', 'action_required'));`
		);

		this.addSql(
			`alter table "user" add constraint "user_investor_status_check" check("investor_status" in ('verified', 'pending', 'unverified', 'rejected', 'NOT_STARTED', 'action_required'));`
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table "sponsor" drop constraint if exists "sponsor_status_check";`
		);

		this.addSql(
			`alter table "user" drop constraint if exists "user_investor_status_check";`
		);

		this.addSql(
			`alter table "sponsor" add constraint "sponsor_status_check" check("status" in ('verified', 'pending', 'unverified', 'rejected', 'NOT_STARTED'));`
		);

		this.addSql(
			`alter table "user" add constraint "user_investor_status_check" check("investor_status" in ('verified', 'pending', 'unverified', 'rejected', 'NOT_STARTED'));`
		);
	}
}
