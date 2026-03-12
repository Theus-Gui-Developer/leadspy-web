import { NextResponse } from "next/server"

import {
  normalizePerfectPayWebhookBatch,
  parsePerfectPayWebhookItem,
  type PerfectPayProcessResult,
  processPerfectPayWebhookItem,
} from "@/lib/billing/perfect-pay"
import { logIncomingWebhook } from "@/lib/webhooks/logs"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    let payload: unknown

    try {
      payload = JSON.parse(rawBody)
    } catch {
      await logIncomingWebhook({
        provider: "perfectpay",
        endpoint: "/api/billing/webhooks/perfect-pay",
        request,
        rawBody,
      })

      return NextResponse.json(
        {
          ok: false,
          message: "Payload JSON invalido.",
          results: [
            {
              ok: false,
              status: "invalid_payload",
              reason: "Nao foi possivel fazer o parse do JSON recebido.",
            },
          ],
        },
        { status: 200 },
      )
    }

    await logIncomingWebhook({
      provider: "perfectpay",
      endpoint: "/api/billing/webhooks/perfect-pay",
      request,
      rawBody,
      payload,
    })

    const batch = normalizePerfectPayWebhookBatch(payload)

    if (batch.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nenhum evento foi recebido.",
          results: [
            {
              ok: false,
              status: "invalid_payload",
              reason: "O corpo da requisicao veio vazio.",
            },
          ],
        },
        { status: 200 },
      )
    }

    const results: PerfectPayProcessResult[] = []

    for (const item of batch) {
      const normalized = parsePerfectPayWebhookItem(item)

      if (!normalized) {
        results.push({
          ok: false,
          status: "invalid_payload",
          reason: "Campos obrigatorios ausentes no webhook.",
        })
        continue
      }

      results.push(await processPerfectPayWebhookItem(normalized))
    }

    const hasProcessedItems = results.some((result) => result.ok)

    return NextResponse.json(
      {
        ok: hasProcessedItems,
        received: batch.length,
        results,
      },
      { status: 200 },
    )
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao processar webhook da PerfectPay."

    return NextResponse.json(
      {
        ok: false,
        message: "Webhook recebido, mas houve falha no processamento.",
        results: [
          {
            ok: false,
            status: "invalid_payload",
            reason,
          },
        ],
      },
      { status: 200 },
    )
  }
}
