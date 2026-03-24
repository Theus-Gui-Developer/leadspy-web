import fs from "fs"
import path from "path"

import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import {
  firecrawlMap,
  FirecrawlNetworkError,
  FirecrawlServiceError,
  FirecrawlTimeoutError,
} from "@/lib/funnel-analysis/firecrawl-client"

export const runtime = "nodejs"

function dumpToFile(filename: string, data: unknown) {
  try {
    const filePath = path.join(process.cwd(), "..", filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
    console.log(`[map] dump salvo em: ${filePath}`)
  } catch (err) {
    console.error("[map] falha ao salvar dump:", err)
  }
}

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(request: Request) {
  const ts = () => new Date().toISOString()
  console.log(`\n[map] ──────────────────────────────────────────`)
  console.log(`[map] ${ts()} → nova requisição recebida`)

  const corsHeaders = buildCorsHeaders(request)

  // ── Auth ──────────────────────────────────────────────────────────────────
  console.log(`[map] ${ts()} verificando autenticação...`)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    console.log(`[map] ${ts()} ✗ não autenticado — abortando`)
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }
  console.log(`[map] ${ts()} ✓ autenticado`)

  // ── Parse do payload ──────────────────────────────────────────────────────
  console.log(`[map] ${ts()} lendo payload...`)
  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    console.log(`[map] ${ts()} ✗ payload JSON inválido`)
    return NextResponse.json(
      { ok: false, message: "Payload JSON invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  if (!payload || typeof payload !== "object") {
    console.log(`[map] ${ts()} ✗ payload não é objeto`)
    return NextResponse.json(
      { ok: false, message: "Payload invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  const { domain, mode } = payload as Record<string, unknown>
  console.log(`[map] ${ts()} domain = ${domain}, mode = ${mode ?? "(não definido)"}`)

  if (typeof domain !== "string" || domain.trim().length === 0) {
    console.log(`[map] ${ts()} ✗ campo 'domain' ausente ou vazio`)
    return NextResponse.json(
      { ok: false, message: "Campo 'domain' e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }

  if (mode !== undefined && mode !== "discovery" && mode !== "sitemap") {
    console.log(`[map] ${ts()} ✗ mode inválido: ${mode}`)
    return NextResponse.json(
      { ok: false, message: "Campo 'mode' invalido. Use 'discovery' ou 'sitemap'." },
      { status: 400, headers: corsHeaders },
    )
  }

  // ── Normaliza o domínio ───────────────────────────────────────────────────
  let baseUrl: string
  try {
    const raw = domain.trim()
    const withProtocol = raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`
    const parsed = new URL(withProtocol)
    baseUrl = parsed.origin
  } catch {
    console.log(`[map] ${ts()} ✗ domínio inválido: ${domain}`)
    return NextResponse.json(
      { ok: false, message: "Dominio invalido." },
      { status: 422, headers: corsHeaders },
    )
  }
  console.log(`[map] ${ts()} ✓ baseUrl normalizada: ${baseUrl}`)

  // ── Chama o Firecrawl /v2/map ─────────────────────────────────────────────
  const callMode = (mode as "discovery" | "sitemap" | undefined) ?? "discovery"
  console.log(`[map] ${ts()} → chamando firecrawlMap (mode=${callMode})...`)
  const mapStart = Date.now()

  try {
    const result = await firecrawlMap({
      url: baseUrl,
      limit: 500,
      includeSubdomains: true,
      ignoreQueryParameters: true,
      sitemap: callMode === "sitemap" ? "only" : "skip",
    })

    const mapMs = Date.now() - mapStart
    console.log(`[map] ${ts()} ✓ firecrawlMap retornou em ${mapMs}ms`)
    console.log(`[map] ${ts()} result.success = ${result.success}`)

    // Salva resposta bruta do Firecrawl em disco
    dumpToFile(`debug-map-${callMode}-raw.json`, result)

    if (!result.success) {
      console.log(`[map] ${ts()} ✗ firecrawl map error: ${result.error}`)
      return NextResponse.json(
        {
          ok: false,
          message: `Firecrawl nao conseguiu mapear o dominio: ${result.error}`,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    console.log(`[map] ${ts()} links retornados = ${result.links.length}`)
    if (result.warning) console.log(`[map] ${ts()} warning: ${result.warning}`)

    const responseJson = {
      ok: true,
      domain: baseUrl,
      total: result.links.length,
      links: result.links,
      warning: result.warning ?? null,
    }
    const responseSize = JSON.stringify(responseJson).length
    console.log(`[map] ${ts()} → enviando resposta (${(responseSize / 1024).toFixed(1)} kB)`)

    return NextResponse.json(responseJson, { status: 200, headers: corsHeaders })
  } catch (err) {
    const mapMs = Date.now() - mapStart
    console.log(`[map] ${ts()} ✗ erro após ${mapMs}ms:`, err)

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

    console.error("[map] erro inesperado:", err)

    return NextResponse.json(
      { ok: false, message: "Erro interno inesperado." },
      { status: 500, headers: corsHeaders },
    )
  }
}
