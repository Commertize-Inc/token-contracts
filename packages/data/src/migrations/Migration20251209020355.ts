import { Migration } from '@mikro-orm/migrations';

export class Migration20251209020355 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "waitlist" ("id" varchar(255) not null, "email" varchar(255) not null, "type" text check ("type" in ('investor', 'sponsor')) not null, "phone" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "investment_amount" varchar(255) null, "investment_timeframe" varchar(255) null, "property_types" varchar(255) null, "experience" varchar(255) null, "full_name" varchar(255) null, "company" varchar(255) null, "property_name" varchar(255) null, "property_location" varchar(255) null, "asset_type" varchar(255) null, "estimated_value" varchar(255) null, "capital_needed" varchar(255) null, "timeline" varchar(255) null, "hear_about_us" varchar(255) null, "additional_info" text null, "message" text null, "created_at" date not null, constraint "waitlist_pkey" primary key ("id"));`);
    this.addSql(`alter table "waitlist" add constraint "waitlist_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "waitlist" cascade;`);
  }

}
