import { pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { timestamps } from "./common"
import { userRoleEnum } from "./enums"

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").default("customer").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    passwordUpdatedAt: timestamp("password_updated_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
)
