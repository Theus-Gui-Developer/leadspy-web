import "server-only"

import { db } from "@/lib/db"
import { webhookLogs } from "@/lib/db/schema"
import { buildTokenPreview, sha256 } from "@/lib/security/hash"

function getRequestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

function extractHeaders(request: Request) {
  const headers = Object.fromEntries(request.headers.entries())
  return headers as Record<string, string>
}

function extractPayloadField(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined
  }

  const value = (payload as Record<string, unknown>)[key]
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function extractTokenPreview(payload: unknown) {
  const token = extractPayloadField(payload, "token")
  return token ? buildTokenPreview(token) : null
}

function extractSaleCode(payload: unknown) {
  return extractPayloadField(payload, "code") ?? null
}

function extractEventType(payload: unknown) {
  const eventType = extractPayloadField(payload, "sale_status_enum_key")

  if (eventType) {
    return eventType
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null
  }

  const subscription = (payload as Record<string, unknown>).subscription

  if (!subscription || typeof subscription !== "object" || Array.isArray(subscription)) {
    return null
  }

  const statusEvent = (subscription as Record<string, unknown>).status_event
  return typeof statusEvent === "string" && statusEvent.trim() ? statusEvent.trim() : null
}

export async function logIncomingWebhook(params: {
  provider: string
  endpoint: string
  request: Request
  rawBody: string
  payload?: unknown
}) {
  try {
    await db.insert(webhookLogs).values({
      provider: params.provider,
      endpoint: params.endpoint,
      method: params.request.method,
      payloadHash: sha256(params.rawBody),
      tokenPreview: extractTokenPreview(params.payload) ?? undefined,
      saleCode: extractSaleCode(params.payload) ?? undefined,
      eventType: extractEventType(params.payload) ?? undefined,
      ipAddress: getRequestIp(params.request) ?? undefined,
      userAgent: params.request.headers.get("user-agent") ?? undefined,
      headers: extractHeaders(params.request),
      rawBody: params.rawBody,
      payload:
        params.payload && typeof params.payload === "object"
          ? (params.payload as Record<string, unknown> | unknown[])
          : undefined,
    })
  } catch {
    return null
  }

  return true
}
