import { Migration } from '@mikro-orm/migrations';

export class Migration20251209091626 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "news_article" ("id" varchar(255) not null, "slug" varchar(255) not null, "title" varchar(255) not null, "summary" text not null, "content" text null, "category" varchar(255) not null, "tags" jsonb null, "image_url" varchar(255) null, "read_time" int not null default 5, "published_at" timestamptz not null, "is_generated" boolean not null default false, "is_published" boolean not null default true, "created_at" date not null, "updated_at" date not null, constraint "news_article_pkey" primary key ("id"));`);
    this.addSql(`create index "news_article_slug_index" on "news_article" ("slug");`);

    this.addSql(`create table "user" ("id" varchar(255) not null, "privy_id" varchar(255) not null, "email" varchar(255) null, "wallet_address" varchar(255) null, "plaid_idv_session_id" varchar(255) null, "stripe_customer_id" varchar(255) null, "created_at" date not null, "updated_at" date not null, "kyc_status" varchar(255) not null default 'not_started', constraint "user_pkey" primary key ("id"));`);
    this.addSql(`create index "user_privy_id_index" on "user" ("privy_id");`);
    this.addSql(`alter table "user" add constraint "user_privy_id_unique" unique ("privy_id");`);

    this.addSql(`create table "plaid_item" ("id" varchar(255) not null, "user_id" varchar(255) not null, "item_id" varchar(255) not null, "access_token" varchar(255) not null, "institution_id" varchar(255) not null, "institution_name" varchar(255) not null, "status" varchar(255) not null default 'active', "last_webhook_at" date null, "error_message" varchar(255) null, "created_at" date not null, "updated_at" date not null, constraint "plaid_item_pkey" primary key ("id"));`);
    this.addSql(`create index "plaid_item_item_id_index" on "plaid_item" ("item_id");`);
    this.addSql(`alter table "plaid_item" add constraint "plaid_item_item_id_unique" unique ("item_id");`);

    this.addSql(`create table "bank_account" ("id" varchar(255) not null, "user_id" varchar(255) not null, "plaid_item_id" varchar(255) not null, "plaid_account_id" varchar(255) not null, "stripe_processor_token" varchar(255) null, "stripe_bank_account_id" varchar(255) null, "stripe_token_created_at" date null, "stripe_token_last_used_at" date null, "account_name" varchar(255) not null, "account_type" varchar(255) not null, "account_mask" varchar(255) not null, "is_verified" boolean not null default true, "is_primary" boolean not null default false, "status" varchar(255) not null default 'active', "created_at" date not null, "updated_at" date not null, constraint "bank_account_pkey" primary key ("id"));`);
    this.addSql(`create index "bank_account_plaid_account_id_index" on "bank_account" ("plaid_account_id");`);
    this.addSql(`alter table "bank_account" add constraint "bank_account_plaid_account_id_unique" unique ("plaid_account_id");`);
    this.addSql(`create index "bank_account_status_index" on "bank_account" ("status");`);

    this.addSql(`create table "waitlist" ("id" varchar(255) not null, "email" varchar(255) not null, "type" text check ("type" in ('investor', 'sponsor')) not null, "phone" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "investment_amount" varchar(255) null, "investment_timeframe" varchar(255) null, "property_types" varchar(255) null, "experience" varchar(255) null, "full_name" varchar(255) null, "company" varchar(255) null, "property_name" varchar(255) null, "property_location" varchar(255) null, "asset_type" varchar(255) null, "estimated_value" varchar(255) null, "capital_needed" varchar(255) null, "timeline" varchar(255) null, "hear_about_us" varchar(255) null, "additional_info" text null, "message" text null, "created_at" date not null, constraint "waitlist_pkey" primary key ("id"));`);
    this.addSql(`alter table "waitlist" add constraint "waitlist_email_unique" unique ("email");`);

    this.addSql(`alter table "plaid_item" add constraint "plaid_item_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "bank_account" add constraint "bank_account_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "bank_account" add constraint "bank_account_plaid_item_id_foreign" foreign key ("plaid_item_id") references "plaid_item" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "plaid_item" drop constraint "plaid_item_user_id_foreign";`);

    this.addSql(`alter table "bank_account" drop constraint "bank_account_user_id_foreign";`);

    this.addSql(`alter table "bank_account" drop constraint "bank_account_plaid_item_id_foreign";`);

    this.addSql(`drop table if exists "news_article" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "plaid_item" cascade;`);

    this.addSql(`drop table if exists "bank_account" cascade;`);

    this.addSql(`drop table if exists "waitlist" cascade;`);
  }

}
