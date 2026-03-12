import "server-only"

import { and, eq } from "drizzle-orm"

import {
  issuePasswordSetupToken,
  sendPasswordSetupEmail,
} from "@/lib/auth/password-setup"
import { db } from "@/lib/db"
import {
  perfectPayWebhookEvents,
  plans,
  subscriptions,
  users,
  webhookProviderTokens,
} from "@/lib/db/schema"
import { sha256 } from "@/lib/security/hash"

type JsonRecord = Record<string, unknown>

type SubscriptionStatus =
  | "pending"
  | "active"
  | "cancelled"
  | "expired"
  | "refunded"
  | "chargeback"

export type PerfectPayWebhookItem = {
  token: string
  saleCode: string
  saleStatusKey?: string
  saleStatusDetail?: string
  dateCreated?: string
  dateApproved?: string
  webhookOwner?: string
  customerEmail: string
  customerName?: string
  planCode?: string
  productCode?: string
  subscriptionCode?: string
  subscriptionStatus?: string
  subscriptionStatusEvent?: string
  rawPayload: JsonRecord
}

export type PerfectPayProcessResult = {
  ok: boolean
  status:
    | "processed"
    | "duplicate"
    | "ignored"
    | "invalid_token"
    | "invalid_payload"
  saleCode?: string
  reason?: string
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getString(record: JsonRecord, key: string) {
  const value = record[key]

  if (typeof value !== "string") {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function getNestedRecord(record: JsonRecord, key: string) {
  const value = record[key]
  return isRecord(value) ? value : undefined
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function parsePerfectPayDateTime(value?: string) {
  if (!value) {
    return null
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?$/,
  )

  if (!match) {
    return null
  }

  const [, year, month, day, hour = "00", minute = "00", second = "00"] = match
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`)
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  const dayOfMonth = nextDate.getUTCDate()

  nextDate.setUTCMonth(nextDate.getUTCMonth() + months)

  if (nextDate.getUTCDate() < dayOfMonth) {
    nextDate.setUTCDate(0)
  }

  return nextDate
}

function mapSubscriptionStatus(payload: PerfectPayWebhookItem): SubscriptionStatus {
  switch (payload.saleStatusKey) {
    case "approved":
    case "authorized":
    case "completed":
      return "active"
    case "refunded":
      return "refunded"
    case "charged_back":
      return "chargeback"
    default:
      return "pending"
  }
}

export function normalizePerfectPayWebhookBatch(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload ? [payload] : []
}

export function parsePerfectPayWebhookItem(payload: unknown): PerfectPayWebhookItem | null {
  if (!isRecord(payload)) {
    return null
  }

  const customer = getNestedRecord(payload, "customer")
  const plan = getNestedRecord(payload, "plan")
  const product = getNestedRecord(payload, "product")
  const subscription = getNestedRecord(payload, "subscription")

  const token = getString(payload, "token")
  const saleCode = getString(payload, "code")
  const customerEmail = customer ? getString(customer, "email") : undefined

  if (!token || !saleCode || !customerEmail) {
    return null
  }

  return {
    token,
    saleCode,
    saleStatusKey: getString(payload, "sale_status_enum_key"),
    saleStatusDetail: getString(payload, "sale_status_detail"),
    dateCreated: getString(payload, "date_created"),
    dateApproved: getString(payload, "date_approved"),
    webhookOwner: getString(payload, "webhook_owner"),
    customerEmail: normalizeEmail(customerEmail),
    customerName: customer ? getString(customer, "full_name") : undefined,
    planCode: plan ? getString(plan, "code") : undefined,
    productCode: product ? getString(product, "code") : undefined,
    subscriptionCode: subscription ? getString(subscription, "code") : undefined,
    subscriptionStatus: subscription ? getString(subscription, "status") : undefined,
    subscriptionStatusEvent: subscription
      ? getString(subscription, "status_event")
      : undefined,
    rawPayload: payload,
  }
}

export async function processPerfectPayWebhookItem(
  payload: PerfectPayWebhookItem,
): Promise<PerfectPayProcessResult> {
  const tokenHash = sha256(payload.token)
  const payloadHash = sha256(JSON.stringify(payload.rawPayload))

  const [providerToken] = await db
    .select({ id: webhookProviderTokens.id })
    .from(webhookProviderTokens)
    .where(
      and(
        eq(webhookProviderTokens.provider, "perfectpay"),
        eq(webhookProviderTokens.tokenHash, tokenHash),
        eq(webhookProviderTokens.isActive, true),
      ),
    )
    .limit(1)

  if (!providerToken) {
    return {
      ok: false,
      status: "invalid_token",
      saleCode: payload.saleCode,
      reason: "Token do webhook nao cadastrado ou inativo.",
    }
  }

  const [existingEvent] = await db
    .select({ id: perfectPayWebhookEvents.id })
    .from(perfectPayWebhookEvents)
    .where(eq(perfectPayWebhookEvents.payloadHash, payloadHash))
    .limit(1)

  if (existingEvent) {
    return {
      ok: true,
      status: "duplicate",
      saleCode: payload.saleCode,
      reason: "Webhook ja processado anteriormente.",
    }
  }

  const planResults = payload.planCode
    ? await db
        .select({ id: plans.id, durationMonths: plans.durationMonths })
        .from(plans)
        .where(
          and(
            eq(plans.provider, "perfectpay"),
            eq(plans.externalCode, payload.planCode),
            eq(plans.isActive, true),
          ),
        )
        .limit(1)
    : []

  const [plan] = planResults

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, payload.customerEmail))
    .limit(1)

  const eventType =
    payload.subscriptionStatusEvent ??
    payload.saleStatusKey ??
    payload.saleStatusDetail ??
    "unknown"

  const [webhookEvent] = await db
    .insert(perfectPayWebhookEvents)
    .values({
      providerTokenId: providerToken.id,
      userId: user?.id ?? null,
      eventType,
      saleCode: payload.saleCode,
      subscriptionCode: payload.subscriptionCode,
      webhookOwner: payload.webhookOwner,
      payloadHash,
      status: plan ? "pending" : "ignored",
      payload: payload.rawPayload,
      errorMessage: plan ? null : "Plano nao encontrado para o codigo recebido.",
    })
    .returning({ id: perfectPayWebhookEvents.id })

  await db
    .update(webhookProviderTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(webhookProviderTokens.id, providerToken.id))

  if (!plan) {
    return {
      ok: true,
      status: "ignored",
      saleCode: payload.saleCode,
      reason: "Plano nao encontrado para o plan.code recebido.",
    }
  }

  const internalStatus = mapSubscriptionStatus(payload)
  const createdAt = parsePerfectPayDateTime(payload.dateCreated)
  const approvedAt = parsePerfectPayDateTime(payload.dateApproved)
  const effectiveDate = approvedAt ?? createdAt ?? new Date()

  const existingSubscription = payload.subscriptionCode
    ? (
        await db
          .select({
            id: subscriptions.id,
            startsAt: subscriptions.startsAt,
            expiresAt: subscriptions.expiresAt,
          })
          .from(subscriptions)
          .where(eq(subscriptions.perfectPaySubscriptionId, payload.subscriptionCode))
          .limit(1)
      )[0]
    : (
        await db
          .select({
            id: subscriptions.id,
            startsAt: subscriptions.startsAt,
            expiresAt: subscriptions.expiresAt,
          })
          .from(subscriptions)
          .where(eq(subscriptions.perfectPaySaleCode, payload.saleCode))
          .limit(1)
      )[0]

  const startsAt =
    internalStatus === "active"
      ? existingSubscription?.startsAt ?? effectiveDate
      : (existingSubscription?.startsAt ?? null)

  const expiresAt =
    internalStatus === "active" && startsAt
      ? addMonths(startsAt, plan.durationMonths)
      : (existingSubscription?.expiresAt ?? null)

  const canceledAt =
    internalStatus === "refunded" ||
    internalStatus === "chargeback"
      ? effectiveDate
      : null

  const subscriptionPayload = {
    userId: user?.id ?? null,
    planId: plan.id,
    customerName: payload.customerName ?? null,
    customerEmail: payload.customerEmail,
    status: internalStatus,
    perfectPaySaleCode: payload.saleCode,
    perfectPaySubscriptionId: payload.subscriptionCode ?? null,
    perfectPayProductId: payload.productCode ?? null,
    perfectPayPlanCode: payload.planCode ?? null,
    perfectPayRawStatus: payload.saleStatusKey ?? payload.subscriptionStatus ?? null,
    startsAt,
    expiresAt,
    canceledAt,
    lastWebhookAt: new Date(),
    metadata: payload.rawPayload,
  } as const

  const [savedSubscription] = existingSubscription
    ? await db
        .update(subscriptions)
        .set(subscriptionPayload)
        .where(eq(subscriptions.id, existingSubscription.id))
        .returning({ id: subscriptions.id })
    : await db
        .insert(subscriptions)
        .values(subscriptionPayload)
        .returning({ id: subscriptions.id })

  let onboardingError: string | null = null

  if (internalStatus === "active" && !user) {
    try {
      const tokenResult = await issuePasswordSetupToken({
        email: payload.customerEmail,
        name: payload.customerName,
        subscriptionId: savedSubscription.id,
      })

      if (tokenResult.created) {
        await sendPasswordSetupEmail({
          email: tokenResult.email,
          name: tokenResult.name,
          rawToken: tokenResult.rawToken,
        })
      }
    } catch (error) {
      onboardingError =
        error instanceof Error
          ? error.message
          : "Falha ao enviar email de configuracao de senha."
    }
  }

  await db
    .update(perfectPayWebhookEvents)
    .set({
      userId: user?.id ?? null,
      subscriptionId: savedSubscription.id,
      status: "processed",
      processedAt: new Date(),
      errorMessage: onboardingError,
    })
    .where(eq(perfectPayWebhookEvents.id, webhookEvent.id))

  return {
    ok: true,
    status: "processed",
    saleCode: payload.saleCode,
    reason: onboardingError ?? undefined,
  }
}
