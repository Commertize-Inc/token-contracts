import { Migration } from '@mikro-orm/migrations';

export class Migration20251225032422 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "sponsor_update_request" ("id" varchar(255) not null, "requested_by_id" varchar(255) not null, "status" text check ("status" in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) not null default 'PENDING', "documents" jsonb null, "admin_notes" text null, "created_at" date not null, "updated_at" date not null, "sponsor_id" varchar(255) not null, "requested_changes" jsonb not null, constraint "sponsor_update_request_pkey" primary key ("id"));`);

    this.addSql(`alter table "sponsor_update_request" add constraint "sponsor_update_request_requested_by_id_foreign" foreign key ("requested_by_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "sponsor_update_request" add constraint "sponsor_update_request_sponsor_id_foreign" foreign key ("sponsor_id") references "sponsor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "sponsor_update_request" cascade;`);
  }

}
