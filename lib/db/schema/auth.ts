import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { subscriptions } from "./billing"
import { timestamps } from "./common"
import { users } from "./users"

export const passwordSetupTokens = pgTable(
  "password_setup_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (table) => [
    index("password_setup_tokens_email_idx").on(table.email),
    index("password_setup_tokens_subscription_id_idx").on(table.subscriptionId),
    index("password_setup_tokens_user_id_idx").on(table.userId),
    uniqueIndex("password_setup_tokens_hash_unique").on(table.tokenHash),
  ],
)
