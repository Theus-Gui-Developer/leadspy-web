CREATE TYPE "public"."auth_session_client" AS ENUM('web', 'extension');--> statement-breakpoint
CREATE TYPE "public"."auth_session_status" AS ENUM('active', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'active', 'cancelled', 'expired', 'refunded', 'chargeback');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer');--> statement-breakpoint
CREATE TYPE "public"."webhook_processing_status" AS ENUM('pending', 'processed', 'ignored', 'failed');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"source" varchar(32) NOT NULL,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(128) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_setup_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"subscription_id" uuid,
	"user_id" uuid,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perfectpay_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_token_id" uuid,
	"user_id" uuid,
	"subscription_id" uuid,
	"event_type" varchar(120) NOT NULL,
	"sale_code" varchar(255),
	"subscription_code" varchar(255),
	"webhook_owner" varchar(100),
	"payload_hash" varchar(64) NOT NULL,
	"external_event_id" varchar(255),
	"transaction_id" varchar(255),
	"status" "webhook_processing_status" DEFAULT 'pending' NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"provider" varchar(50) DEFAULT 'perfectpay' NOT NULL,
	"external_code" varchar(255) NOT NULL,
	"duration_months" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"features" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"plan_id" uuid,
	"customer_name" varchar(255),
	"customer_email" varchar(255) NOT NULL,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"perfectpay_customer_id" varchar(255),
	"perfectpay_subscription_id" varchar(255),
	"perfectpay_sale_code" varchar(255),
	"perfectpay_product_id" varchar(255),
	"perfectpay_plan_code" varchar(255),
	"perfectpay_raw_status" varchar(120),
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"last_webhook_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_provider_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"owner_code" varchar(100),
	"label" varchar(120),
	"token_hash" varchar(64) NOT NULL,
	"token_preview" varchar(12) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client" "auth_session_client" DEFAULT 'web' NOT NULL,
	"access_token_hash" varchar(64) NOT NULL,
	"refresh_token_hash" varchar(64) NOT NULL,
	"installation_id" varchar(128),
	"status" "auth_session_status" DEFAULT 'active' NOT NULL,
	"ip_address" varchar(64),
	"user_agent" varchar(512),
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"access_token_expires_at" timestamp with time zone NOT NULL,
	"refresh_token_expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"last_login_at" timestamp with time zone,
	"password_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"payload_hash" varchar(64) NOT NULL,
	"token_preview" varchar(24),
	"sale_code" varchar(255),
	"event_type" varchar(120),
	"ip_address" varchar(64),
	"user_agent" varchar(512),
	"headers" jsonb,
	"raw_body" text NOT NULL,
	"payload" jsonb,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_setup_tokens" ADD CONSTRAINT "password_setup_tokens_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_setup_tokens" ADD CONSTRAINT "password_setup_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfectpay_webhook_events" ADD CONSTRAINT "perfectpay_webhook_events_provider_token_id_webhook_provider_tokens_id_fk" FOREIGN KEY ("provider_token_id") REFERENCES "public"."webhook_provider_tokens"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfectpay_webhook_events" ADD CONSTRAINT "perfectpay_webhook_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfectpay_webhook_events" ADD CONSTRAINT "perfectpay_webhook_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "password_setup_tokens_email_idx" ON "password_setup_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_setup_tokens_subscription_id_idx" ON "password_setup_tokens" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "password_setup_tokens_user_id_idx" ON "password_setup_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "password_setup_tokens_hash_unique" ON "password_setup_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "perfectpay_webhook_events_provider_token_id_idx" ON "perfectpay_webhook_events" USING btree ("provider_token_id");--> statement-breakpoint
CREATE INDEX "perfectpay_webhook_events_user_id_idx" ON "perfectpay_webhook_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "perfectpay_webhook_events_subscription_id_idx" ON "perfectpay_webhook_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "perfectpay_webhook_events_status_idx" ON "perfectpay_webhook_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "perfectpay_webhook_events_sale_code_idx" ON "perfectpay_webhook_events" USING btree ("sale_code");--> statement-breakpoint
CREATE INDEX "perfectpay_webhook_events_subscription_code_idx" ON "perfectpay_webhook_events" USING btree ("subscription_code");--> statement-breakpoint
CREATE UNIQUE INDEX "perfectpay_webhook_events_external_event_id_unique" ON "perfectpay_webhook_events" USING btree ("external_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "perfectpay_webhook_events_payload_hash_unique" ON "perfectpay_webhook_events" USING btree ("payload_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_slug_unique" ON "plans" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_provider_external_code_unique" ON "plans" USING btree ("provider","external_code");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_email_idx" ON "subscriptions" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_perfectpay_sale_code_unique" ON "subscriptions" USING btree ("perfectpay_sale_code");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_perfectpay_subscription_id_unique" ON "subscriptions" USING btree ("perfectpay_subscription_id");--> statement-breakpoint
CREATE INDEX "webhook_provider_tokens_provider_idx" ON "webhook_provider_tokens" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "webhook_provider_tokens_owner_code_idx" ON "webhook_provider_tokens" USING btree ("owner_code");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_provider_tokens_hash_unique" ON "webhook_provider_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_client_idx" ON "auth_sessions" USING btree ("client");--> statement-breakpoint
CREATE INDEX "auth_sessions_installation_id_idx" ON "auth_sessions" USING btree ("installation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_user_client_unique" ON "auth_sessions" USING btree ("user_id","client");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_access_token_hash_unique" ON "auth_sessions" USING btree ("access_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_unique" ON "auth_sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "webhook_logs_provider_idx" ON "webhook_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "webhook_logs_endpoint_idx" ON "webhook_logs" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "webhook_logs_payload_hash_idx" ON "webhook_logs" USING btree ("payload_hash");--> statement-breakpoint
CREATE INDEX "webhook_logs_sale_code_idx" ON "webhook_logs" USING btree ("sale_code");