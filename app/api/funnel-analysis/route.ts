import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import {
  firecrawlScrape,
  FirecrawlNetworkError,
  FirecrawlServiceError,
  FirecrawlTimeoutError,
} from "@/lib/funnel-analysis/firecrawl-client"
import { analyzeFunnelPage } from "@/lib/funnel-analysis/analyzer"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(request: Request) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }

  // ── Parse do payload ──────────────────────────────────────────────────────
  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    return NextResponse.json(
      { ok: false, message: "Payload JSON invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, message: "Payload invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  const { url } = payload as Record<string, unknown>

  if (typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Campo 'url' e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }

  // ── Valida a URL antes de enviar ao Firecrawl ─────────────────────────────
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    return NextResponse.json(
      { ok: false, message: "URL invalida. Use o formato https://exemplo.com" },
      { status: 422, headers: corsHeaders },
    )
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json(
      { ok: false, message: "Protocolo nao suportado. Use http ou https." },
      { status: 422, headers: corsHeaders },
    )
  }

  // ── Chama o Firecrawl ─────────────────────────────────────────────────────
  try {
    const scrapeResult = await firecrawlScrape({
      url: parsedUrl.href,
      formats: ["html", "markdown", "links", "images"],
    })

    if (!scrapeResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: `O Firecrawl nao conseguiu acessar a pagina: ${scrapeResult.error}`,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    const analysis = analyzeFunnelPage(parsedUrl.href, scrapeResult.data)

    return NextResponse.json(
      { ok: true, analysis },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    if (err instanceof FirecrawlTimeoutError) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "A pagina demorou demais para responder. Verifique a URL e tente novamente.",
        },
        { status: 504, headers: corsHeaders },
      )
    }

    if (err instanceof FirecrawlNetworkError) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Nao foi possivel conectar ao servico de analise. Verifique se ele esta em execucao.",
        },
        { status: 503, headers: corsHeaders },
      )
    }

    if (err instanceof FirecrawlServiceError) {
      return NextResponse.json(
        {
          ok: false,
          message: `Erro interno no servico de analise (HTTP ${err.statusCode}).`,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    console.error("[funnel-analysis] erro inesperado:", err)

    return NextResponse.json(
      { ok: false, message: "Erro interno inesperado." },
      { status: 500, headers: corsHeaders },
    )
  }
}
