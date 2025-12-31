import { Migration } from '@mikro-orm/migrations';

export class Migration20251231195601_waitlist_nonunique_email extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "waitlist" drop constraint "waitlist_email_unique";`);

    this.addSql(`create index "waitlist_email_index" on "waitlist" ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "waitlist_email_index";`);

    this.addSql(`alter table "waitlist" add constraint "waitlist_email_unique" unique ("email");`);
  }

}
