CREATE TABLE "saved_ad_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"folder_id" uuid,
	"ad_id" varchar(32) NOT NULL,
	"library_url" varchar(512),
	"advertiser_name" varchar(255),
	"advertiser_link" varchar(512),
	"page_id" varchar(64),
	"ad_text" text,
	"site_url" varchar(512),
	"domain" varchar(255),
	"media_type" varchar(32),
	"thumbnail_url" varchar(1024),
	"metadata" jsonb,
	"share_token" varchar(32),
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_ads_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
ALTER TABLE "saved_ad_folders" ADD CONSTRAINT "saved_ad_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_ads" ADD CONSTRAINT "saved_ads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_ads" ADD CONSTRAINT "saved_ads_folder_id_saved_ad_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."saved_ad_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_ad_folders_user_slug_unique" ON "saved_ad_folders" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "saved_ad_folders_user_id_idx" ON "saved_ad_folders" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_ads_user_ad_unique" ON "saved_ads" USING btree ("user_id","ad_id");--> statement-breakpoint
CREATE INDEX "saved_ads_user_id_idx" ON "saved_ads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_ads_folder_id_idx" ON "saved_ads" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "saved_ads_domain_idx" ON "saved_ads" USING btree ("user_id","domain");--> statement-breakpoint
CREATE INDEX "saved_ads_share_token_idx" ON "saved_ads" USING btree ("share_token");