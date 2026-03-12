import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"
import postgres, { type Sql } from "postgres"

import { env } from "@/lib/env"
import * as schema from "@/lib/db/schema"

const globalForDb = globalThis as typeof globalThis & {
  leadspySql?: Sql
}

const sql =
  globalForDb.leadspySql ??
  postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  })

if (env.NODE_ENV !== "production") {
  globalForDb.leadspySql = sql
}

export const db = drizzle(sql, { schema })

export type Database = typeof db
export { sql }
