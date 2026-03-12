import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestamps } from "./common"

export const webhookProviderTokens = pgTable(
  "webhook_provider_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 50 }).notNull(),
    ownerCode: varchar("owner_code", { length: 100 }),
    label: varchar("label", { length: 120 }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    tokenPreview: varchar("token_preview", { length: 12 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    index("webhook_provider_tokens_provider_idx").on(table.provider),
    index("webhook_provider_tokens_owner_code_idx").on(table.ownerCode),
    uniqueIndex("webhook_provider_tokens_hash_unique").on(table.tokenHash),
  ],
)
