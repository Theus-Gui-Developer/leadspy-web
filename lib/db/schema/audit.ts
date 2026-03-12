import { index, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core"

import { timestamps } from "./common"
import { users } from "./users"

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    source: varchar("source", { length: 32 }).notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 128 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (table) => [
    index("audit_logs_actor_user_id_idx").on(table.actorUserId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  ],
)
