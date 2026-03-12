import "server-only"

import { and, eq, isNotNull, lt } from "drizzle-orm"

import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"

export async function expireSubscriptionsForUser(userId: string) {
  const now = new Date()

  await db
    .update(subscriptions)
    .set({
      status: "expired",
      canceledAt: now,
    })
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        isNotNull(subscriptions.expiresAt),
        lt(subscriptions.expiresAt, now),
      ),
    )
}
