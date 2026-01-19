import { Migration } from '@mikro-orm/migrations';

export class Migration20260119071816_WalletAndCurrency extends Migration {

	override async up(): Promise<void> {
		this.addSql(`create table if not exists "wallet" ("id" varchar(255) not null, "user_id" varchar(255) not null, "address" varchar(255) not null, "name" varchar(255) not null, "created_at" date not null, "updated_at" date not null, constraint "wallet_pkey" primary key ("id"));`);

		this.addSql(`do $$
		begin
			if not exists (select 1 from information_schema.table_constraints where constraint_name = 'wallet_user_id_foreign') then
				alter table "wallet" add constraint "wallet_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;
			end if;
		end $$;`);

		this.addSql(`do $$
		begin
			if not exists (select 1 from information_schema.columns where table_name='sponsor' and column_name='wallet_address') then
				alter table "sponsor" add column "wallet_address" varchar(255) null;
			end if;
		end $$;`);

		this.addSql(`do $$
		begin
			alter table "listing" add column if not exists "is_gas_sponsored" boolean not null default false;
			alter table "listing" add column if not exists "funding_currency" varchar(255) not null default 'USDC';
			alter table "listing" add column if not exists "escrow_contract_address" varchar(255) null;
		end $$;`);

		this.addSql(`do $$
		begin
			alter table "investment" add column if not exists "currency" varchar(255) not null default 'USD';
		end $$;`);

		this.addSql(`do $$
		begin
			if exists (select 1 from information_schema.columns where table_name='investment' and column_name='amount_usdc') then
				alter table "investment" rename column "amount_usdc" to "amount";
			end if;
		end $$;`);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "wallet" cascade;`);

		this.addSql(`alter table "sponsor" drop column "wallet_address";`);

		this.addSql(`alter table "listing" drop column "is_gas_sponsored", drop column "funding_currency", drop column "escrow_contract_address";`);

		this.addSql(`alter table "investment" drop column "currency";`);

		this.addSql(`alter table "investment" rename column "amount" to "amount_usdc";`);
	}

}
