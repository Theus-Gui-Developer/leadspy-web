import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import {
  firecrawlMap,
  type FirecrawlMapDocument,
  FirecrawlNetworkError,
  FirecrawlServiceError,
  FirecrawlTimeoutError,
} from "@/lib/funnel-analysis/firecrawl-client"

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

  const { domain } = payload as Record<string, unknown>

  if (typeof domain !== "string" || domain.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Campo 'domain' e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }

  // ── Normaliza o domínio para uma URL base válida ──────────────────────────
  // Recebe "kiwify.com.br" ou "https://kiwify.com.br" — normaliza para URL.
  let baseUrl: string
  try {
    const raw = domain.trim()
    const withProtocol = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`
    const parsed = new URL(withProtocol)
    // Usa apenas origin (protocolo + hostname), sem path
    baseUrl = parsed.origin
  } catch {
    return NextResponse.json(
      { ok: false, message: "Dominio invalido." },
      { status: 422, headers: corsHeaders },
    )
  }

  // ── Chama o Firecrawl /v2/map ─────────────────────────────────────────────
  try {
    const [discoveryResult, sitemapResult] = await Promise.all([
      firecrawlMap({
        url: baseUrl,
        limit: 500,
        includeSubdomains: true,
        ignoreQueryParameters: true,
        sitemap: "skip",
      }),
      firecrawlMap({
        url: baseUrl,
        limit: 500,
        includeSubdomains: true,
        ignoreQueryParameters: true,
        sitemap: "only",
      }),
    ])

    if (!discoveryResult.success && !sitemapResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: `Firecrawl nao conseguiu mapear o dominio: ${discoveryResult.error}`,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    const byUrl = new Map<string, FirecrawlMapDocument>()

    function appendLinks(links: FirecrawlMapDocument[]) {
      for (const link of links) {
        const existing = byUrl.get(link.url)

        if (!existing) {
          byUrl.set(link.url, link)
          continue
        }

        if ((link.title && !existing.title) || (link.description && !existing.description)) {
          byUrl.set(link.url, {
            url: link.url,
            title: link.title ?? existing.title,
            description: link.description ?? existing.description,
          })
        }
      }
    }

    if (discoveryResult.success) appendLinks(discoveryResult.links)
    if (sitemapResult.success) appendLinks(sitemapResult.links)

    const warning = [
      discoveryResult.success ? discoveryResult.warning : null,
      sitemapResult.success ? sitemapResult.warning : null,
    ]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .join(" | ") || null

    const links = Array.from(byUrl.values())

    return NextResponse.json(
      {
        ok: true,
        domain: baseUrl,
        total: links.length,
        links,
        warning,
      },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    if (err instanceof FirecrawlTimeoutError) {
      return NextResponse.json(
        {
          ok: false,
          message: "O mapeamento demorou demais. O dominio pode ser muito grande ou estar indisponivel.",
        },
        { status: 504, headers: corsHeaders },
      )
    }

    if (err instanceof FirecrawlNetworkError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nao foi possivel conectar ao servico de analise.",
        },
        { status: 503, headers: corsHeaders },
      )
    }

    if (err instanceof FirecrawlServiceError) {
      return NextResponse.json(
        {
          ok: false,
          message: `Erro no servico de analise (HTTP ${err.statusCode}).`,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    console.error("[funnel-analysis/map] erro inesperado:", err)

    return NextResponse.json(
      { ok: false, message: "Erro interno inesperado." },
      { status: 500, headers: corsHeaders },
    )
  }
}
