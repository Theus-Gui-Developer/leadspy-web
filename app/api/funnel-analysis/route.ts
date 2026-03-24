import fs from "fs"
import path from "path"

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

function dumpToFile(filename: string, data: unknown) {
  try {
    const filePath = path.join(process.cwd(), "..", filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
    console.log(`[scrape] dump salvo em: ${filePath}`)
  } catch (err) {
    console.error("[scrape] falha ao salvar dump:", err)
  }
}

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(request: Request) {
  const ts = () => new Date().toISOString()
  console.log(`\n[scrape] ──────────────────────────────────────────`)
  console.log(`[scrape] ${ts()} → nova requisição recebida`)

  const corsHeaders = buildCorsHeaders(request)

  // ── Auth ──────────────────────────────────────────────────────────────────
  console.log(`[scrape] ${ts()} verificando autenticação...`)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    console.log(`[scrape] ${ts()} ✗ não autenticado — abortando`)
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }
  console.log(`[scrape] ${ts()} ✓ autenticado`)

  // ── Parse do payload ──────────────────────────────────────────────────────
  console.log(`[scrape] ${ts()} lendo payload...`)
  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    console.log(`[scrape] ${ts()} ✗ payload JSON inválido`)
    return NextResponse.json(
      { ok: false, message: "Payload JSON invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  if (!payload || typeof payload !== "object") {
    console.log(`[scrape] ${ts()} ✗ payload não é objeto`)
    return NextResponse.json(
      { ok: false, message: "Payload invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  const { url } = payload as Record<string, unknown>

  if (typeof url !== "string" || url.trim().length === 0) {
    console.log(`[scrape] ${ts()} ✗ campo 'url' ausente ou vazio`)
    return NextResponse.json(
      { ok: false, message: "Campo 'url' e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }
  console.log(`[scrape] ${ts()} ✓ url recebida: ${url}`)

  // ── Valida a URL ──────────────────────────────────────────────────────────
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    console.log(`[scrape] ${ts()} ✗ URL inválida: ${url}`)
    return NextResponse.json(
      { ok: false, message: "URL invalida. Use o formato https://exemplo.com" },
      { status: 422, headers: corsHeaders },
    )
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    console.log(`[scrape] ${ts()} ✗ protocolo inválido: ${parsedUrl.protocol}`)
    return NextResponse.json(
      { ok: false, message: "Protocolo nao suportado. Use http ou https." },
      { status: 422, headers: corsHeaders },
    )
  }
  console.log(`[scrape] ${ts()} ✓ URL válida: ${parsedUrl.href}`)

  // ── Chama o Firecrawl ─────────────────────────────────────────────────────
  console.log(`[scrape] ${ts()} → chamando firecrawlScrape...`)
  const scrapeStart = Date.now()

  try {
    const scrapeResult = await firecrawlScrape({
      url: parsedUrl.href,
      formats: ["markdown", "links", "images"],
    })

    const scrapeMs = Date.now() - scrapeStart
    console.log(`[scrape] ${ts()} ✓ firecrawlScrape retornou em ${scrapeMs}ms`)
    console.log(`[scrape] ${ts()} scrapeResult.success = ${scrapeResult.success}`)

    // Salva resposta bruta do Firecrawl em disco
    dumpToFile("debug-scrape-raw.json", scrapeResult)

    if (!scrapeResult.success) {
      console.log(`[scrape] ${ts()} ✗ firecrawl error: ${scrapeResult.error}`)
      return NextResponse.json(
        {
          ok: false,
          message: `O Firecrawl nao conseguiu acessar a pagina: ${scrapeResult.error}`,
        },
        { status: 502, headers: corsHeaders },
      )
    }

    const { data } = scrapeResult
    console.log(`[scrape] ${ts()} metadata.statusCode = ${data.metadata.statusCode}`)
    console.log(`[scrape] ${ts()} metadata.url = ${data.metadata.url ?? "(não definido)"}`)
    console.log(`[scrape] ${ts()} markdown length = ${data.markdown?.length ?? 0}`)
    console.log(`[scrape] ${ts()} links count = ${data.links?.length ?? 0}`)
    console.log(`[scrape] ${ts()} images count = ${data.images?.length ?? 0}`)

    console.log(`[scrape] ${ts()} → chamando analyzeFunnelPage...`)
    const analysis = analyzeFunnelPage(parsedUrl.href, data)
    console.log(`[scrape] ${ts()} ✓ análise concluída`)
    console.log(`[scrape] ${ts()} analysis.platform = ${analysis.platform ?? "(null)"}`)
    console.log(`[scrape] ${ts()} analysis.pageType = ${analysis.pageType ?? "(null)"}`)
    console.log(`[scrape] ${ts()} analysis.checkoutLinks = ${analysis.checkoutLinks.length}`)

    // Salva análise final em disco
    dumpToFile("debug-scrape-analysis.json", { ok: true, analysis })

    const responseJson = { ok: true, analysis }
    const responseSize = JSON.stringify(responseJson).length
    console.log(`[scrape] ${ts()} → enviando resposta (${(responseSize / 1024).toFixed(1)} kB)`)

    return NextResponse.json(responseJson, { status: 200, headers: corsHeaders })
  } catch (err) {
    const scrapeMs = Date.now() - scrapeStart
    console.log(`[scrape] ${ts()} ✗ erro após ${scrapeMs}ms:`, err)

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

    console.error("[scrape] erro inesperado:", err)

    return NextResponse.json(
      { ok: false, message: "Erro interno inesperado." },
      { status: 500, headers: corsHeaders },
    )
  }
}
