/**
 * Resultado normalizado da análise de funil de uma página.
 * Este tipo é compartilhado entre o analyzer (server) e os componentes (client).
 * Não importar "server-only" aqui — é usado em ambos os lados.
 */
export type FunnelAnalysisResult = {
  // ── URLs ──────────────────────────────────────────────────────────────────
  /** URL original enviada pelo usuário */
  initialUrl: string
  /** URL final após todos os redirecionamentos (metadata.url do Firecrawl) */
  finalUrl: string
  /** Hops de redirecionamento detectados */
  redirectChain: string[]

  // ── Decomposição da URL final ─────────────────────────────────────────────
  rootDomain: string
  subdomain: string | null
  /** Todos os segmentos do pathname (ex: ["produtos", "checkout", "oferta-vip"]) */
  slugs: string[]

  // ── Inferências ───────────────────────────────────────────────────────────
  pageType: string | null
  platform: string | null
  confidence: "high" | "medium" | "low"

  // ── Links mapeados ────────────────────────────────────────────────────────
  /** Todos os links encontrados na página */
  allLinks: string[]
  /** Links que parecem ser checkouts (URL contém padrões de checkout) */
  checkoutLinks: string[]
  /** Subdomínios únicos encontrados nos links da página */
  linkedSubdomains: string[]
  /** Domínios externos encontrados nos links */
  externalDomains: string[]

  // ── Sinais / rastreadores ─────────────────────────────────────────────────
  signals: string[]

  // ── Conteúdo ──────────────────────────────────────────────────────────────
  /** Markdown da página para exibição/análise */
  markdown: string | null
  /** Título da página (<title>) */
  pageTitle: string | null

  // ── Open Graph / metadados sociais ────────────────────────────────────────
  /** Título Open Graph (como aparece ao compartilhar no WhatsApp, Facebook etc.) */
  ogTitle: string | null
  /** Descrição Open Graph (texto do link preview) */
  ogDescription: string | null
  /** URL da imagem Open Graph (thumbnail do link preview) */
  ogImage: string | null
  /** Meta keywords */
  keywords: string | null
  /** Idioma declarado da página */
  language: string | null

  // ── Imagens ───────────────────────────────────────────────────────────────
  /** Lista filtrada de imagens encontradas na página */
  images: string[]
}
