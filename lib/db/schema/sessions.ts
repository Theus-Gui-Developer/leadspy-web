import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestamps } from "./common"
import { authSessionClientEnum, authSessionStatusEnum } from "./enums"
import { users } from "./users"

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    client: authSessionClientEnum("client").default("web").notNull(),
    accessTokenHash: varchar("access_token_hash", { length: 64 }).notNull(),
    refreshTokenHash: varchar("refresh_token_hash", { length: 64 }).notNull(),
    installationId: varchar("installation_id", { length: 128 }),
    status: authSessionStatusEnum("status").default("active").notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 512 }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }).notNull(),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (table) => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_client_idx").on(table.client),
    index("auth_sessions_installation_id_idx").on(table.installationId),
    uniqueIndex("auth_sessions_user_client_unique").on(table.userId, table.client),
    uniqueIndex("auth_sessions_access_token_hash_unique").on(table.accessTokenHash),
    uniqueIndex("auth_sessions_refresh_token_hash_unique").on(table.refreshTokenHash),
  ],
)
