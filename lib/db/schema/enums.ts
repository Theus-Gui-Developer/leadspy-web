import { pgEnum } from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["admin", "customer"])

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "cancelled",
  "expired",
  "refunded",
  "chargeback",
])

export const authSessionClientEnum = pgEnum("auth_session_client", [
  "web",
  "extension",
])

export const authSessionStatusEnum = pgEnum("auth_session_status", [
  "active",
  "revoked",
  "expired",
])

export const webhookProcessingStatusEnum = pgEnum("webhook_processing_status", [
  "pending",
  "processed",
  "ignored",
  "failed",
])
