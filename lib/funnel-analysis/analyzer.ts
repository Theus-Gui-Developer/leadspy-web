import "server-only"

import type { FirecrawlDocument } from "@/lib/funnel-analysis/firecrawl-client"
import type { FunnelAnalysisResult } from "@/lib/funnel-analysis/types"

// ---------------------------------------------------------------------------
// Plataformas conhecidas (padrão no hostname ou no HTML)
// ---------------------------------------------------------------------------

const PLATFORM_PATTERNS: Array<[RegExp, string]> = [
  // Plataformas brasileiras de infoprodutos
  [/kiwify\.com\.br/, "Kiwify"],
  [/hotmart\.com/, "Hotmart"],
  [/eduzz\.com/, "Eduzz"],
  [/monetizze\.com\.br/, "Monetizze"],
  [/cakto\.com\.br/, "Cakto"],
  [/perfectpay\.com\.br/, "PerfectPay"],
  [/braip\.com/, "Braip"],
  [/ticto\.com\.br/, "Ticto"],
  [/yampi\.com\.br/, "Yampi"],
  [/herospark\.com/, "HeroSpark"],
  [/kirvano\.com/, "Kirvano"],
  [/lastlink\.com/, "Lastlink"],
  [/greenn\.com\.br/, "Greenn"],
  [/doppus\.app|doppus\.com/, "Doppus"],
  [/hub\.la/, "Hub.la"],
  [/assiny\.com\.br/, "Assiny"],
  [/mycartpanda\.com/, "CartPanda"],
  [/pepper\.com\.br/, "Pepper"],
  [/payt\.com\.br/, "Payt"],
  [/guru\.com\.br/, "Guru"],
  // Gateways e plataformas globais
  [/pagseguro\.uol\.com\.br/, "PagSeguro"],
  [/checkout\.stripe\.com|stripe\.com/, "Stripe"],
  [/mercadopago\.com\.br|mercadolivre/, "Mercado Pago"],
  [/nuvemshop\.com\.br/, "Nuvemshop"],
  [/shopify\.com/, "Shopify"],
  [/systeme\.io/, "Systeme.io"],
  [/clickfunnels\.com/, "ClickFunnels"],
  [/leadpages\.net/, "Leadpages"],
  [/builderall\.com/, "Builderall"],
]

// ---------------------------------------------------------------------------
// Padrões de checkout para classificar links
// ---------------------------------------------------------------------------

/**
 * Padrões testados contra a URL completa (href).
 * Cobrem path-based checkouts: /checkout, /payment, /cart, etc.
 */
const CHECKOUT_URL_PATTERNS = [
  /checkout/i,
  /pagamento/i,
  /payment/i,
  /\/pay\//i,
  /\/buy\//i,
  /\/order\//i,
  /\/comprar\//i,
  /\/assinar\//i,
  /\/subscribe\//i,
  /\/carrinho\//i,
  /\/cart\//i,
]

/**
 * Padrões testados contra o hostname isolado.
 * Cobrem subdomínios/domínios de plataformas de checkout brasileiras
 * cujo hostname já indica que a URL é de checkout (ex: pay.hotmart.com,
 * pay.kiwify.com.br, sun.eduzz.com, payfast.greenn.com.br, etc.)
 */
const CHECKOUT_HOSTNAME_PATTERNS: RegExp[] = [
  /^pay\./,                  // pay.hotmart.com, pay.kiwify.com.br, pay.monetizze.com.br…
  /^checkout\./,             // checkout.perfectpay.com.br, checkout.doppus.app…
  /^payfast\./,              // payfast.greenn.com.br
  /^pagamento\./,            // pagamento.* genérico
  /sun\.eduzz\.com/,         // sun.eduzz.com
  /\.mycartpanda\.com/,      // *.mycartpanda.com
  /ev\.braip\.com/,          // ev.braip.com (checkout da Braip)
  /lastlink\.com/,           // lastlink.com/p/.../checkout-payment
  /hub\.la/,                 // pay.hub.la
]

// ---------------------------------------------------------------------------
// Tipo de página — prioridade top-down (primeira regra que bate vence)
// ---------------------------------------------------------------------------

type PageTypeRule = {
  pattern: RegExp
  type: string
  target: "url" | "html" | "title"
}

const PAGE_TYPE_RULES: PageTypeRule[] = [
  { pattern: /checkout|pagamento|payment|comprar|buy|order|assinar|subscribe/i, target: "url", type: "Checkout" },
  { pattern: /checkout|pagamento|payment|comprar|buy|order/i, target: "title", type: "Checkout" },
  // Checkout embed via HTML (iframe ou atributo data-checkout)
  { pattern: /<iframe[^>]*checkout|data-checkout|id=["']checkout["']/i, target: "html", type: "Checkout (embed)" },
  // Campos de cartão de crédito no HTML
  { pattern: /credit.?card|card.?number|numero.*cart[aã]o|cvv|expir/i, target: "html", type: "Checkout" },
  { pattern: /upsell|bump|oferta.?especial|special.?offer/i, target: "url", type: "Upsell / Order Bump" },
  { pattern: /obrigado|thank.?you|confirmacao|confirmation|pedido.?confirmado/i, target: "url", type: "Página de Obrigado" },
  { pattern: /obrigado|thank.?you|confirmado|order.?confirmed/i, target: "title", type: "Página de Obrigado" },
  { pattern: /webinar|inscricao|inscription|registro|register|captura/i, target: "url", type: "Página de Captação" },
  { pattern: /webinar|inscreva.?se|cadastre.?se|acesso.?gratuito/i, target: "title", type: "Página de Captação" },
  { pattern: /quiz|questionario/i, target: "url", type: "Funil de Quiz" },
]

// ---------------------------------------------------------------------------
// Sinais / rastreadores detectados no HTML
// ---------------------------------------------------------------------------

type SignalRule = { pattern: RegExp; label: string }

const SIGNAL_RULES: SignalRule[] = [
  { pattern: /fbq\s*\(|facebook\.com\/tr/i, label: "Meta Pixel" },
  { pattern: /gtag\s*\(|googletagmanager\.com/i, label: "Google Analytics / GTM" },
  { pattern: /ttq\s*\.|tiktok\.com\/i18n\/pixel|tiktok-pixel/i, label: "TikTok Pixel" },
  { pattern: /kwai.*pixel|kwaiads|kwai_pixel/i, label: "Kwai Pixel" },
  { pattern: /pintrk\s*\(|pinterest\.com\/v3\//i, label: "Pinterest Tag" },
  { pattern: /snaptr\s*\(|sc-static\.net\/scevent/i, label: "Snap Pixel" },
  { pattern: /taboola|_taboola/i, label: "Taboola" },
  { pattern: /outbrain|ob_click/i, label: "Outbrain" },
  { pattern: /clarity\.ms|ms\.clarity/i, label: "Microsoft Clarity" },
  { pattern: /hotjar\.com|hjid\s*=|hjsv\s*=/i, label: "Hotjar" },
  { pattern: /intercom\.io|window\.intercomSettings/i, label: "Intercom" },
  { pattern: /crisp\.chat|window\.\$crisp/i, label: "Crisp Chat" },
  { pattern: /rdstation|RdIntegration/i, label: "RD Station" },
  { pattern: /activecampaign\.com/i, label: "ActiveCampaign" },
  { pattern: /klaviyo\.com|window\._klOnsite/i, label: "Klaviyo" },
  { pattern: /vturb|SmartPlayer/i, label: "VTurb (VSL Player)" },
  { pattern: /panda\.video|pandavideo/i, label: "PandaVideo" },
  { pattern: /wistia\.com|wistia_/i, label: "Wistia" },
  { pattern: /ev\.io\/|easyads\.com\.br/i, label: "EasyAds" },
  { pattern: /sck=|src=|utm_source=/i, label: "Parâmetros de rastreio" },
  { pattern: /whatsapp\.com\/send|wa\.me\//i, label: "CTA WhatsApp" },
]

// ---------------------------------------------------------------------------
// Decomposição de URL
// ---------------------------------------------------------------------------

function parseUrlParts(rawUrl: string): {
  rootDomain: string
  subdomain: string | null
  slugs: string[]
} {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { rootDomain: rawUrl, subdomain: null, slugs: [] }
  }

  const hostname = parsed.hostname
  const parts = hostname.split(".")

  let rootDomain: string
  let subdomain: string | null = null

  // Trata TLDs compostos: .com.br, .net.br, .org.br, .edu.br
  const secondLevelTlds = ["com", "net", "org", "edu", "gov", "mil"]
  if (
    parts.length >= 3 &&
    secondLevelTlds.includes(parts[parts.length - 2] ?? "") &&
    parts[parts.length - 1] === "br"
  ) {
    rootDomain = parts.slice(-3).join(".")
    subdomain = parts.length > 3 ? parts.slice(0, -3).join(".") : null
  } else if (parts.length >= 2) {
    rootDomain = parts.slice(-2).join(".")
    subdomain = parts.length > 2 ? parts.slice(0, -2).join(".") : null
  } else {
    rootDomain = hostname
  }

  const slugs = parsed.pathname.split("/").filter(Boolean)

  return { rootDomain, subdomain, slugs }
}

// ---------------------------------------------------------------------------
// Análise dos links da página
// ---------------------------------------------------------------------------

function analyzeLinks(
  links: string[],
  rootDomain: string,
): {
  checkoutLinks: string[]
  linkedSubdomains: string[]
  externalDomains: string[]
} {
  const checkoutLinks: string[] = []
  const linkedSubdomainsSet = new Set<string>()
  const externalDomainsSet = new Set<string>()

  for (const link of links) {
    let parsed: URL
    try {
      parsed = new URL(link)
    } catch {
      continue
    }

    const href = parsed.href
    const hostname = parsed.hostname

    // Detecta checkouts — por padrão no href OU no hostname
    const isCheckout =
      CHECKOUT_URL_PATTERNS.some((p) => p.test(href)) ||
      CHECKOUT_HOSTNAME_PATTERNS.some((p) => p.test(hostname))
    if (isCheckout) {
      checkoutLinks.push(href)
    }

    // Detecta subdomínios do mesmo domínio raiz
    if (hostname.endsWith(rootDomain) && hostname !== rootDomain) {
      const sub = hostname.slice(0, -(rootDomain.length + 1))
      if (sub && sub !== "www") {
        linkedSubdomainsSet.add(sub + "." + rootDomain)
      }
    }

    // Detecta domínios externos (não são o rootDomain nem subdomínio dele)
    if (!hostname.endsWith(rootDomain) && !hostname.endsWith("facebook.com") && !hostname.endsWith("instagram.com")) {
      // Remove www e extrai domínio limpo
      const cleanHost = hostname.replace(/^www\./, "")
      if (cleanHost && !cleanHost.includes("google") && !cleanHost.includes("gstatic")) {
        externalDomainsSet.add(cleanHost)
      }
    }
  }

  return {
    checkoutLinks: [...new Set(checkoutLinks)],
    linkedSubdomains: [...linkedSubdomainsSet],
    externalDomains: [...externalDomainsSet].slice(0, 20), // limita a 20
  }
}

// ---------------------------------------------------------------------------
// Inferências
// ---------------------------------------------------------------------------

function detectPlatform(url: string, html: string): string | null {
  const subject = url + " " + html
  for (const [pattern, name] of PLATFORM_PATTERNS) {
    if (pattern.test(subject)) return name
  }
  return null
}

function detectPageType(url: string, html: string, title: string): string | null {
  for (const rule of PAGE_TYPE_RULES) {
    const subject = rule.target === "url" ? url : rule.target === "html" ? html : title
    if (rule.pattern.test(subject)) return rule.type
  }
  if (/<form/i.test(html)) return "Página com Formulário"
  return "Landing Page"
}

function detectSignals(html: string): string[] {
  return SIGNAL_RULES.filter((r) => r.pattern.test(html)).map((r) => r.label)
}

function calcConfidence(
  platform: string | null,
  pageType: string | null,
  signals: string[],
): FunnelAnalysisResult["confidence"] {
  let score = 0
  if (platform) score += 2
  if (pageType && pageType !== "Landing Page") score += 1
  if (signals.length >= 3) score += 2
  else if (signals.length >= 1) score += 1
  if (score >= 4) return "high"
  if (score >= 2) return "medium"
  return "low"
}

// ---------------------------------------------------------------------------
// Filtro de imagens
// ---------------------------------------------------------------------------

/**
 * Remove imagens irrelevantes para análise de funil:
 * - data URIs e blob URLs
 * - ícones de favicon / apple-touch-icon
 * - arquivos .ico
 * - pixels de rastreamento (padrões conhecidos)
 * - URLs vazias
 */
function filterImages(images: string[]): string[] {
  const seen = new Set<string>()
  return images.filter((url) => {
    if (!url) return false
    if (seen.has(url)) return false
    seen.add(url)
    if (url.startsWith("data:") || url.startsWith("blob:")) return false
    if (/favicon/i.test(url)) return false
    if (/\.(ico)(\?|$)/i.test(url)) return false
    // pixels de rastreamento comuns (1x1 ou parâmetros indicadores)
    if (/[?&](w|width)=1(&|$)/i.test(url)) return false
    if (/\/(pixel|px|beacon|track|trk)\//i.test(url)) return false
    return true
  })
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

export function analyzeFunnelPage(
  initialUrl: string,
  doc: FirecrawlDocument,
): FunnelAnalysisResult {
  const html = doc.html ?? doc.rawHtml ?? ""
  const pageTitle = doc.metadata.title ?? null

  /**
   * URL final após redirecionamentos:
   * - metadata.url = URL final  (campo correto do Firecrawl)
   * - metadata.sourceURL = URL original solicitada
   * - doc.url = também pode conter a URL final (populado pelos transformers)
   * Fallback em cadeia para garantir que sempre temos algo.
   */
  const finalUrl =
    (doc.metadata.url && doc.metadata.url !== doc.metadata.sourceURL
      ? doc.metadata.url
      : null) ??
    doc.url ??
    initialUrl

  const { rootDomain, subdomain, slugs } = parseUrlParts(finalUrl)

  const allLinks = doc.links ?? []
  const { checkoutLinks, linkedSubdomains, externalDomains } = analyzeLinks(allLinks, rootDomain)

  // Detecta plataforma apenas pela URL — evita falso positivo por links externos
  const platform = detectPlatform(finalUrl, "")
  const pageType = detectPageType(finalUrl, html, pageTitle ?? "")
  const signals = detectSignals(html)
  const confidence = calcConfidence(platform, pageType, signals)

  // Cadeia de redirect: só monta se a URL final for diferente da inicial
  const redirectChain =
    finalUrl !== initialUrl ? [initialUrl, finalUrl] : []

  // Open Graph e metadados sociais
  const ogTitle = doc.metadata.ogTitle ?? null
  const ogDescription = doc.metadata.ogDescription ?? doc.metadata.description ?? null
  const ogImage = doc.metadata.ogImage ?? null
  const keywords = doc.metadata.keywords ?? null
  const language = doc.metadata.language ?? null

  // Imagens da página (filtradas)
  const images = filterImages(doc.images ?? [])

  return {
    initialUrl,
    finalUrl,
    redirectChain,
    rootDomain,
    subdomain,
    slugs,
    pageType,
    platform,
    confidence,
    allLinks,
    checkoutLinks,
    linkedSubdomains,
    externalDomains,
    signals,
    markdown: doc.markdown ?? null,
    pageTitle,
    ogTitle,
    ogDescription,
    ogImage,
    keywords,
    language,
    images,
  }
}
