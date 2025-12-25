import { Migration } from "@mikro-orm/migrations";

export class Migration20251224234531 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table "legal_document" ("id" varchar(255) not null, "related_entity_id" uuid not null, "related_entity_type" text check ("related_entity_type" in ('USER', 'PROPERTY')) not null, "document_type" text check ("document_type" in ('TAX_FORM', 'OM', 'SUBSCRIPTION_AGREEMENT', 'ACCREDITATION_PROOF')) not null, "file_url" varchar(255) not null, "updated_at" date not null, constraint "legal_document_pkey" primary key ("id"));`
		);
		this.addSql(
			`create index "legal_document_related_entity_id_index" on "legal_document" ("related_entity_id");`
		);
		this.addSql(
			`create index "legal_document_related_entity_type_index" on "legal_document" ("related_entity_type");`
		);

		this.addSql(
			`create table "news_article" ("id" varchar(255) not null, "slug" varchar(255) not null, "title" varchar(255) not null, "summary" text not null, "content" text null, "category" varchar(255) not null, "tags" jsonb null, "image_url" varchar(255) null, "read_time" int not null default 5, "published_at" timestamptz not null, "is_generated" boolean not null default false, "is_published" boolean not null default true, "created_at" date not null, "updated_at" date not null, constraint "news_article_pkey" primary key ("id"));`
		);
		this.addSql(
			`create index "news_article_slug_index" on "news_article" ("slug");`
		);

		this.addSql(
			`create table "sponsor" ("id" varchar(255) not null, "business_name" varchar(255) not null, "ein" varchar(255) null, "address" varchar(255) null, "bio" text null, "status" text check ("status" in ('verified', 'pending', 'unverified', 'rejected', 'NOT_STARTED')) not null default 'unverified', "kyb_data" jsonb null, "voting_members" jsonb not null, "created_at" date not null, "updated_at" date not null, constraint "sponsor_pkey" primary key ("id"));`
		);

		this.addSql(
			`create table "listing" ("id" varchar(255) not null, "sponsor_id" varchar(255) not null, "status" text check ("status" in ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'TOKENIZING', 'ACTIVE', 'FULLY_FUNDED', 'REJECTED', 'WITHDRAWN', 'FROZEN')) not null default 'DRAFT', "offering_type" text check ("offering_type" in ('RULE_506_B', 'RULE_506_C', 'REG_A', 'REG_CF', 'REG_S')) not null default 'RULE_506_B', "name" varchar(255) not null, "address" varchar(255) not null, "city" varchar(255) not null, "state" varchar(255) not null, "zip_code" varchar(255) not null, "property_type" varchar(255) not null, "entity_structure" text check ("entity_structure" in ('LLC', 'C_CORP', 'LP', 'SERIES_LLC', 'REIT', 'TRUST')) null, "financials" jsonb not null, "tokenomics" jsonb not null, "images" text[] not null default '{}', "documents" jsonb not null default '[]', "token_contract_address" varchar(255) null, "description" text null, "highlights" text[] not null default '{}', "construction_year" int null, "total_units" int null, "created_at" date not null, "updated_at" date not null, constraint "listing_pkey" primary key ("id"));`
		);
		this.addSql(`create index "listing_status_index" on "listing" ("status");`);

		this.addSql(
			`create table "dividend" ("id" varchar(255) not null, "amount" real not null, "distribution_date" date not null, "status" varchar(255) not null default 'pending', "listing_id" varchar(255) not null, "created_at" date not null, constraint "dividend_pkey" primary key ("id"));`
		);

		this.addSql(
			`create table "user" ("id" varchar(255) not null, "privy_id" varchar(255) not null, "role" text check ("role" in ('investor', 'sponsor', 'admin', 'sponsor_investor')) null, "is_admin" boolean not null default false, "email" varchar(255) null, "wallet_address" varchar(255) null, "first_name" varchar(255) null, "last_name" varchar(255) null, "phone_number" varchar(255) null, "bio" text null, "avatar_url" varchar(255) null, "username" varchar(255) null, "plaid_idv_session_id" varchar(255) null, "plaid_watchlist_screening_id" varchar(255) null, "plaid_watchlist_screening_status" varchar(255) null, "country_of_residence" varchar(255) null, "date_of_birth" date null, "risk_score" numeric(5,2) null, "stripe_customer_id" varchar(255) null, "created_at" date not null, "updated_at" date not null, "kyc_status" text check ("kyc_status" in ('not_started', 'pending', 'approved', 'rejected', 'documents_required')) not null default 'not_started', "job_title" varchar(255) null, "sponsor_id" varchar(255) null, "organization_role" varchar(255) null, "investor_status" text check ("investor_status" in ('verified', 'pending', 'unverified', 'rejected', 'NOT_STARTED')) null default 'unverified', "investor_type" text check ("investor_type" in ('INDIVIDUAL', 'INSTITUTIONAL')) null default 'INDIVIDUAL', "investor_accreditation_type" text check ("investor_accreditation_type" in ('REG_D', 'REG_S')) null default 'REG_D', "investor_verification_method" text check ("investor_verification_method" in ('SELF_CERTIFICATION', 'THIRD_PARTY_LETTER', 'INCOME_PROOF', 'NET_WORTH_PROOF')) null, "investor_verified_at" date null, "investor_investment_experience" text check ("investor_investment_experience" in ('NONE', 'LIMITED', 'GOOD', 'EXTENSIVE')) null, "investor_risk_tolerance" text check ("investor_risk_tolerance" in ('LOW', 'MEDIUM', 'HIGH')) null, "investor_liquid_net_worth" varchar(255) null, "investor_tax_country" varchar(255) null, "investor_accreditation_documents" jsonb null, "investor_docuseal_submission_id" varchar(255) null, "investor_docuseal_template_id" varchar(255) null, "investor_preferences" jsonb null, "investor_created_at" date null, "investor_updated_at" date null, constraint "user_pkey" primary key ("id"));`
		);
		this.addSql(`create index "user_privy_id_index" on "user" ("privy_id");`);
		this.addSql(
			`alter table "user" add constraint "user_privy_id_unique" unique ("privy_id");`
		);
		this.addSql(
			`alter table "user" add constraint "user_username_unique" unique ("username");`
		);

		this.addSql(
			`create table "review_comment" ("id" varchar(255) not null, "entity_type" text check ("entity_type" in ('KYC', 'INVESTOR', 'SPONSOR', 'LISTING')) not null, "entity_id" varchar(255) not null, "author_id" varchar(255) not null, "content" text not null, "is_internal" boolean not null default false, "created_at" date not null, constraint "review_comment_pkey" primary key ("id"));`
		);

		this.addSql(
			`create table "plaid_item" ("id" varchar(255) not null, "user_id" varchar(255) not null, "item_id" varchar(255) not null, "access_token" varchar(255) not null, "institution_id" varchar(255) not null, "institution_name" varchar(255) not null, "status" varchar(255) not null default 'active', "last_webhook_at" date null, "error_message" varchar(255) null, "created_at" date not null, "updated_at" date not null, constraint "plaid_item_pkey" primary key ("id"));`
		);
		this.addSql(
			`create index "plaid_item_item_id_index" on "plaid_item" ("item_id");`
		);
		this.addSql(
			`alter table "plaid_item" add constraint "plaid_item_item_id_unique" unique ("item_id");`
		);

		this.addSql(
			`create table "notification" ("id" varchar(255) not null, "user_id" varchar(255) not null, "title" varchar(255) not null, "message" text not null, "type" varchar(255) not null default 'info', "is_read" boolean not null default false, "link" varchar(255) null, "created_at" date not null, constraint "notification_pkey" primary key ("id"));`
		);

		this.addSql(
			`create table "investment" ("id" varchar(255) not null, "user_id" varchar(255) not null, "property_id" varchar(255) not null, "amount_usdc" numeric(20,6) not null, "token_count" int not null, "status" text check ("status" in ('PENDING', 'COMPLETED', 'FAILED')) not null default 'PENDING', "transaction_hash" varchar(255) null, "signed_subscription_agreement_url" varchar(255) null, "agreed_to_terms_at" date null, "created_at" date not null, "updated_at" date not null, constraint "investment_pkey" primary key ("id"));`
		);
		this.addSql(
			`create index "investment_status_index" on "investment" ("status");`
		);

		this.addSql(
			`create table "bank_account" ("id" varchar(255) not null, "user_id" varchar(255) not null, "plaid_item_id" varchar(255) not null, "plaid_account_id" varchar(255) not null, "stripe_processor_token" varchar(255) null, "stripe_bank_account_id" varchar(255) null, "stripe_token_created_at" date null, "stripe_token_last_used_at" date null, "account_name" varchar(255) not null, "account_type" varchar(255) not null, "account_mask" varchar(255) not null, "is_verified" boolean not null default true, "is_primary" boolean not null default false, "status" varchar(255) not null default 'active', "created_at" date not null, "updated_at" date not null, constraint "bank_account_pkey" primary key ("id"));`
		);
		this.addSql(
			`create index "bank_account_plaid_account_id_index" on "bank_account" ("plaid_account_id");`
		);
		this.addSql(
			`alter table "bank_account" add constraint "bank_account_plaid_account_id_unique" unique ("plaid_account_id");`
		);
		this.addSql(
			`create index "bank_account_status_index" on "bank_account" ("status");`
		);

		this.addSql(
			`create table "waitlist" ("id" varchar(255) not null, "email" varchar(255) not null, "type" text check ("type" in ('investor', 'sponsor')) not null, "phone" varchar(255) null, "country" varchar(255) null, "city" varchar(255) null, "investment_amount" varchar(255) null, "investment_timeframe" varchar(255) null, "property_types" varchar(255) null, "experience" varchar(255) null, "full_name" varchar(255) null, "company" varchar(255) null, "property_name" varchar(255) null, "property_location" varchar(255) null, "asset_type" varchar(255) null, "estimated_value" varchar(255) null, "capital_needed" varchar(255) null, "timeline" varchar(255) null, "hear_about_us" varchar(255) null, "additional_info" text null, "message" text null, "created_at" date not null, constraint "waitlist_pkey" primary key ("id"));`
		);
		this.addSql(
			`alter table "waitlist" add constraint "waitlist_email_unique" unique ("email");`
		);

		this.addSql(
			`alter table "listing" add constraint "listing_sponsor_id_foreign" foreign key ("sponsor_id") references "sponsor" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "dividend" add constraint "dividend_listing_id_foreign" foreign key ("listing_id") references "listing" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "user" add constraint "user_sponsor_id_foreign" foreign key ("sponsor_id") references "sponsor" ("id") on update cascade on delete set null;`
		);

		this.addSql(
			`alter table "review_comment" add constraint "review_comment_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "plaid_item" add constraint "plaid_item_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`
		);

		this.addSql(
			`alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "investment" add constraint "investment_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`
		);
		this.addSql(
			`alter table "investment" add constraint "investment_property_id_foreign" foreign key ("property_id") references "listing" ("id") on update cascade;`
		);

		this.addSql(
			`alter table "bank_account" add constraint "bank_account_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`
		);
		this.addSql(
			`alter table "bank_account" add constraint "bank_account_plaid_item_id_foreign" foreign key ("plaid_item_id") references "plaid_item" ("id") on update cascade on delete cascade;`
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table "listing" drop constraint "listing_sponsor_id_foreign";`
		);

		this.addSql(
			`alter table "user" drop constraint "user_sponsor_id_foreign";`
		);

		this.addSql(
			`alter table "dividend" drop constraint "dividend_listing_id_foreign";`
		);

		this.addSql(
			`alter table "investment" drop constraint "investment_property_id_foreign";`
		);

		this.addSql(
			`alter table "review_comment" drop constraint "review_comment_author_id_foreign";`
		);

		this.addSql(
			`alter table "plaid_item" drop constraint "plaid_item_user_id_foreign";`
		);

		this.addSql(
			`alter table "notification" drop constraint "notification_user_id_foreign";`
		);

		this.addSql(
			`alter table "investment" drop constraint "investment_user_id_foreign";`
		);

		this.addSql(
			`alter table "bank_account" drop constraint "bank_account_user_id_foreign";`
		);

		this.addSql(
			`alter table "bank_account" drop constraint "bank_account_plaid_item_id_foreign";`
		);

		this.addSql(`drop table if exists "legal_document" cascade;`);

		this.addSql(`drop table if exists "news_article" cascade;`);

		this.addSql(`drop table if exists "sponsor" cascade;`);

		this.addSql(`drop table if exists "listing" cascade;`);

		this.addSql(`drop table if exists "dividend" cascade;`);

		this.addSql(`drop table if exists "user" cascade;`);

		this.addSql(`drop table if exists "review_comment" cascade;`);

		this.addSql(`drop table if exists "plaid_item" cascade;`);

		this.addSql(`drop table if exists "notification" cascade;`);

		this.addSql(`drop table if exists "investment" cascade;`);

		this.addSql(`drop table if exists "bank_account" cascade;`);

		this.addSql(`drop table if exists "waitlist" cascade;`);
	}
}
