import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestamps } from "./common"
import { subscriptionStatusEnum, webhookProcessingStatusEnum } from "./enums"
import { webhookProviderTokens } from "./integrations"
import { users } from "./users"

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    provider: varchar("provider", { length: 50 }).default("perfectpay").notNull(),
    externalCode: varchar("external_code", { length: 255 }).notNull(),
    durationMonths: integer("duration_months").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    features: jsonb("features").$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("plans_slug_unique").on(table.slug),
    uniqueIndex("plans_provider_external_code_unique").on(
      table.provider,
      table.externalCode,
    ),
  ],
)

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 255 }),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    status: subscriptionStatusEnum("status").default("pending").notNull(),
    perfectPayCustomerId: varchar("perfectpay_customer_id", { length: 255 }),
    perfectPaySubscriptionId: varchar("perfectpay_subscription_id", {
      length: 255,
    }),
    perfectPaySaleCode: varchar("perfectpay_sale_code", {
      length: 255,
    }),
    perfectPayProductId: varchar("perfectpay_product_id", { length: 255 }),
    perfectPayPlanCode: varchar("perfectpay_plan_code", { length: 255 }),
    perfectPayRawStatus: varchar("perfectpay_raw_status", { length: 120 }),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    lastWebhookAt: timestamp("last_webhook_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_plan_id_idx").on(table.planId),
    index("subscriptions_customer_email_idx").on(table.customerEmail),
    index("subscriptions_status_idx").on(table.status),
    uniqueIndex("subscriptions_perfectpay_sale_code_unique").on(
      table.perfectPaySaleCode,
    ),
    uniqueIndex("subscriptions_perfectpay_subscription_id_unique").on(
      table.perfectPaySubscriptionId,
    ),
  ],
)

export const perfectPayWebhookEvents = pgTable(
  "perfectpay_webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    providerTokenId: uuid("provider_token_id").references(
      () => webhookProviderTokens.id,
      { onDelete: "set null" },
    ),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    eventType: varchar("event_type", { length: 120 }).notNull(),
    saleCode: varchar("sale_code", { length: 255 }),
    subscriptionCode: varchar("subscription_code", { length: 255 }),
    webhookOwner: varchar("webhook_owner", { length: 100 }),
    payloadHash: varchar("payload_hash", { length: 64 }).notNull(),
    externalEventId: varchar("external_event_id", { length: 255 }),
    transactionId: varchar("transaction_id", { length: 255 }),
    status: webhookProcessingStatusEnum("status").default("pending").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    ...timestamps(),
  },
  (table) => [
    index("perfectpay_webhook_events_provider_token_id_idx").on(table.providerTokenId),
    index("perfectpay_webhook_events_user_id_idx").on(table.userId),
    index("perfectpay_webhook_events_subscription_id_idx").on(table.subscriptionId),
    index("perfectpay_webhook_events_status_idx").on(table.status),
    index("perfectpay_webhook_events_sale_code_idx").on(table.saleCode),
    index("perfectpay_webhook_events_subscription_code_idx").on(
      table.subscriptionCode,
    ),
    uniqueIndex("perfectpay_webhook_events_external_event_id_unique").on(
      table.externalEventId,
    ),
    uniqueIndex("perfectpay_webhook_events_payload_hash_unique").on(
      table.payloadHash,
    ),
  ],
)
