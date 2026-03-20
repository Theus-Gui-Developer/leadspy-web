import "server-only"

import { env } from "@/lib/env"

// ---------------------------------------------------------------------------
// Tipos do contrato Firecrawl v2 — baseado em src/controllers/v2/types.ts
// ---------------------------------------------------------------------------

export type FirecrawlScrapeFormat = "html" | "markdown" | "links" | "rawHtml" | "screenshot" | "images"

export type FirecrawlScrapeRequest = {
  url: string
  formats: FirecrawlScrapeFormat[]
  /** Aguarda (ms) antes de capturar a página */
  waitFor?: number
  /** Timeout total da requisição ao Firecrawl (ms) — padrão 30s */
  timeout?: number
}

/**
 * Metadados retornados pelo Firecrawl dentro de `data.metadata`.
 * Campos obrigatórios: statusCode, proxyUsed.
 * Os demais são opcionais e dependem do conteúdo da página.
 */
export type FirecrawlMetadata = {
  /** Título da página (<title>) */
  title?: string
  description?: string
  language?: string
  keywords?: string
  robots?: string
  // Open Graph
  ogTitle?: string
  ogDescription?: string
  ogUrl?: string
  ogImage?: string
  ogAudio?: string
  ogDeterminer?: string
  ogLocale?: string
  ogLocaleAlternate?: string[]
  ogSiteName?: string
  ogVideo?: string
  favicon?: string
  // Datas e publicação
  publishedTime?: string
  modifiedTime?: string
  articleSection?: string
  articleTag?: string
  // HTTP / técnico
  contentType?: string
  statusCode: number
  /**
   * URL FINAL da página após todos os redirecionamentos.
   */
  url?: string
  sourceURL?: string
  error?: string
  proxyUsed: "basic" | "stealth"
  cacheState?: "hit" | "miss"
  cachedAt?: string
  concurrencyLimited?: boolean
  concurrencyQueueDurationMs?: number
  [key: string]: unknown
}

/**
 * Documento retornado pelo Firecrawl em `data`.
 * Cada campo só está presente se o respectivo format foi solicitado.
 */
export type FirecrawlDocument = {
  /** URL final (após redirects) — também disponível em metadata.url */
  url?: string
  /** Markdown limpo e processado */
  markdown?: string
  /** HTML processado/limpo (sem scripts, sem estilos inline) */
  html?: string
  /** HTML completamente bruto como recebido do servidor */
  rawHtml?: string
  /** Lista de URLs encontradas na página */
  links?: string[]
  /** Lista de URLs de imagens encontradas na página (requer format "images") */
  images?: string[]
  /** Screenshot em base64 (requer format "screenshot") */
  screenshot?: string
  /** Metadados da página — SEMPRE presente */
  metadata: FirecrawlMetadata
}

export type FirecrawlScrapeSuccess = {
  success: true
  data: FirecrawlDocument
  scrape_id?: string
}

export type FirecrawlScrapeError = {
  success: false
  error: string
}

export type FirecrawlScrapeResult = FirecrawlScrapeSuccess | FirecrawlScrapeError

// ---------------------------------------------------------------------------
// Erros tipados
// ---------------------------------------------------------------------------

export class FirecrawlNetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = "FirecrawlNetworkError"
  }
}

export class FirecrawlTimeoutError extends Error {
  constructor(url: string) {
    super(`Firecrawl timeout ao acessar: ${url}`)
    this.name = "FirecrawlTimeoutError"
  }
}

export class FirecrawlServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = "FirecrawlServiceError"
  }
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 35_000

/**
 * Executa um scrape via Firecrawl self-hosted (local ou VPS).
 *
 * FIRECRAWL_API_URL controla o endpoint:
 *   - local:      http://localhost:3002   (desenvolvimento)
 *   - produção:   https://firecrawl.sua-vps.com
 */
export async function firecrawlScrape(
  params: FirecrawlScrapeRequest,
): Promise<FirecrawlScrapeResult> {
  const endpoint = `${env.FIRECRAWL_API_URL}/v2/scrape`

  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    params.timeout ?? DEFAULT_TIMEOUT_MS,
  )

  let response: Response

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: params.url,
        formats: params.formats,
        ...(params.waitFor !== undefined && { waitFor: params.waitFor }),
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new FirecrawlTimeoutError(params.url)
    }
    throw new FirecrawlNetworkError(
      `Falha ao conectar com o Firecrawl em ${endpoint}`,
      err,
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let detail = ""
    try {
      const body = (await response.json()) as { error?: string }
      detail = typeof body?.error === "string" ? body.error : JSON.stringify(body)
    } catch {
      // ignora erro de parse do body de erro
    }
    throw new FirecrawlServiceError(
      response.status,
      `Firecrawl retornou HTTP ${response.status}: ${detail}`,
    )
  }

  return (await response.json()) as FirecrawlScrapeResult
}

// ---------------------------------------------------------------------------
// Map — descobre URLs de um domínio inteiro
// ---------------------------------------------------------------------------

export type FirecrawlMapRequest = {
  /** URL do domínio a ser mapeado (ex: https://exemplo.com.br) */
  url: string
  /** Limite de URLs retornadas (1–100000, default: 5000) */
  limit?: number
  /** Inclui subdomínios no resultado (default: true) */
  includeSubdomains?: boolean
  /** Remove parâmetros de query das URLs (default: true) */
  ignoreQueryParameters?: boolean
  /** Comportamento do sitemap: "only" | "include" | "skip" (default: "include") */
  sitemap?: "only" | "include" | "skip"
  /** Timeout total desta requisição em ms (default: 60s) */
  timeout?: number
}

/**
 * Cada item retornado pelo /v2/map.
 * `url` é obrigatório; `title` e `description` são opcionais
 * (presentes quando o Firecrawl tem os metadados em cache).
 */
export type FirecrawlMapDocument = {
  url: string
  title?: string
  description?: string
}

export type FirecrawlMapSuccess = {
  success: true
  links: FirecrawlMapDocument[]
  warning?: string
}

export type FirecrawlMapError = {
  success: false
  error: string
}

export type FirecrawlMapResult = FirecrawlMapSuccess | FirecrawlMapError

const DEFAULT_MAP_TIMEOUT_MS = 60_000

/**
 * Chama o endpoint /v2/map do Firecrawl para descobrir todas as URLs
 * indexadas de um domínio.
 *
 * Use `rootDomain` (ex: "https://exemplo.com.br") — não precisa de path.
 */
export async function firecrawlMap(
  params: FirecrawlMapRequest,
): Promise<FirecrawlMapResult> {
  const endpoint = `${env.FIRECRAWL_API_URL}/v2/map`

  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    params.timeout ?? DEFAULT_MAP_TIMEOUT_MS,
  )

  let response: Response

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: params.url,
        ...(params.limit !== undefined && { limit: params.limit }),
        ...(params.includeSubdomains !== undefined && { includeSubdomains: params.includeSubdomains }),
        ...(params.ignoreQueryParameters !== undefined && { ignoreQueryParameters: params.ignoreQueryParameters }),
        ...(params.sitemap !== undefined && { sitemap: params.sitemap }),
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new FirecrawlTimeoutError(params.url)
    }
    throw new FirecrawlNetworkError(
      `Falha ao conectar com o Firecrawl em ${endpoint}`,
      err,
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let detail = ""
    try {
      const body = (await response.json()) as { error?: string }
      detail = typeof body?.error === "string" ? body.error : JSON.stringify(body)
    } catch {
      // ignora erro de parse do body de erro
    }
    throw new FirecrawlServiceError(
      response.status,
      `Firecrawl /v2/map retornou HTTP ${response.status}: ${detail}`,
    )
  }

  return (await response.json()) as FirecrawlMapResult
}
