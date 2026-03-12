import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestamps } from "./common"

export const webhookLogs = pgTable(
  "webhook_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 50 }).notNull(),
    endpoint: varchar("endpoint", { length: 255 }).notNull(),
    method: varchar("method", { length: 10 }).notNull(),
    payloadHash: varchar("payload_hash", { length: 64 }).notNull(),
    tokenPreview: varchar("token_preview", { length: 24 }),
    saleCode: varchar("sale_code", { length: 255 }),
    eventType: varchar("event_type", { length: 120 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 512 }),
    headers: jsonb("headers").$type<Record<string, string>>(),
    rawBody: text("raw_body").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown> | unknown[]>(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps(),
  },
  (table) => [
    index("webhook_logs_provider_idx").on(table.provider),
    index("webhook_logs_endpoint_idx").on(table.endpoint),
    index("webhook_logs_payload_hash_idx").on(table.payloadHash),
    index("webhook_logs_sale_code_idx").on(table.saleCode),
  ],
)
