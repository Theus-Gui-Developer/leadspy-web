"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ListViewIcon,
  Search01Icon,
  Copy01Icon,
  ExternalLink,
  AlertCircleIcon,
  GlobalIcon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading_spinner"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type MapLink = {
  url: string
  title?: string
  description?: string
}

type MapState =
  | { status: "loading" }
  | { status: "success"; links: MapLink[]; total: number; warning: string | null }
  | { status: "error"; message: string }

type ResearchQuery = {
  id: string
  label: string
  description: string
  query: string
  kind: "ready" | "template"
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function parseUrl(url: string): { hostname: string; slug: string } {
  try {
    const { hostname, pathname, search } = new URL(url)
    const slug = pathname === "/" || pathname === "" ? "/" : `${pathname}${search}`
    return { hostname, slug }
  } catch {
    return { hostname: url, slug: "" }
  }
}

function getBrandHint(rootDomain: string): string {
  return rootDomain
    .replace(/^www\./, "")
    .replace(/\.(com|net|org|edu|gov|mil)\.br$/i, "")
    .replace(/\.[^.]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim()
}

function getResearchQueries(rootDomain: string): ResearchQuery[] {
  const cleanDomain = rootDomain.replace(/^www\./, "")
  const brandHint = getBrandHint(cleanDomain)

  return [
    {
      id: "all-pages",
      label: "Ver mais páginas do domínio",
      description: "Busca básica para achar páginas indexadas fora da listagem atual.",
      query: `site:${cleanDomain}`,
      kind: "ready",
    },
    {
      id: "subdomains",
      label: "Tentar achar subdomínios",
      description: "Ajuda a encontrar áreas como app, members, pay, blog ou landing pages em subdomínios.",
      query: `site:*.${cleanDomain} -site:www.${cleanDomain}`,
      kind: "ready",
    },
    {
      id: "offer-pages",
      label: "Encontrar páginas de oferta",
      description: "Procura páginas de venda, checkout, compra, garantia e outras páginas comerciais.",
      query: `site:${cleanDomain} (oferta OR checkout OR comprar OR pagamento OR guarantee OR garantia OR inscreva-se OR order OR buy)`,
      kind: "ready",
    },
    {
      id: "funnels",
      label: "Achar VSLs e presells",
      description: "Bom para encontrar VSL, quiz, landing, obrigado e páginas intermediárias do funil.",
      query: `site:${cleanDomain} (inurl:vsl OR inurl:quiz OR inurl:lp OR inurl:landing OR inurl:obrigado OR inurl:bridge)`,
      kind: "ready",
    },
    {
      id: "files",
      label: "Buscar PDFs e materiais",
      description: "Útil para localizar iscas, e-books, apresentações e materiais escondidos.",
      query: `site:${cleanDomain} (filetype:pdf OR filetype:doc OR filetype:ppt)`,
      kind: "ready",
    },
    {
      id: "brand-reputation",
      label: "Checar reputação e reviews",
      description: "Ajuda usuário leigo a ver reputação, comentários, review e reclamações do nome/marca.",
      query: `("${brandHint}" OR site:${cleanDomain}) (review OR отзывы OR funciona OR reclame aqui OR reclamação)`,
      kind: "ready",
    },
  ]
}

function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function FunnelMapPanel({ rootDomain }: { rootDomain: string }) {
  const [state, setState] = useState<MapState>({ status: "loading" })
  const [search, setSearch] = useState("")
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null)
  const researchQueries = getResearchQueries(rootDomain)

  useEffect(() => {
    let cancelled = false

    async function fetchMap() {
      setState({ status: "loading" })
      try {
        const response = await fetch("/api/funnel-analysis/map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: rootDomain }),
        })

        const json = (await response.json()) as
          | { ok: true; links: MapLink[]; total: number; warning: string | null }
          | { ok: false; message: string }

        if (cancelled) return
        if (!json.ok) { setState({ status: "error", message: json.message }); return }
        setState({ status: "success", links: json.links, total: json.total, warning: json.warning })
      } catch {
        if (!cancelled) setState({ status: "error", message: "Falha ao buscar o mapa do domínio." })
      }
    }

    fetchMap()
    return () => { cancelled = true }
  }, [rootDomain])

  const filteredLinks =
    state.status === "success"
      ? state.links.filter((l) => {
          if (!search.trim()) return true
          const q = search.toLowerCase()
          return (
            l.url.toLowerCase().includes(q) ||
            (l.title ?? "").toLowerCase().includes(q)
          )
        })
      : []

  async function handleCopyQuery(id: string, query: string) {
    await navigator.clipboard.writeText(query)
    setCopiedQueryId(id)
    setTimeout(() => setCopiedQueryId(null), 1800)
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-5 space-y-4">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <HugeiconsIcon icon={ListViewIcon} size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Mapa de URLs</p>
              <p className="text-xs text-muted-foreground">
                Todas as páginas indexadas de <span className="font-mono">{rootDomain}</span>
              </p>
            </div>
          </div>
          {state.status === "success" && (
            <span className="shrink-0 rounded border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground">
              {state.total} URLs
            </span>
          )}
        </div>

        {/* Loading */}
        {state.status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <LoadingSpinner size="md" label="Mapeando domínio..." />
            <p className="animate-pulse text-sm text-muted-foreground">
              Descobrindo URLs de <span className="font-mono font-medium">{rootDomain}</span>…
            </p>
            <p className="text-xs text-muted-foreground/50">Pode levar até 60 segundos</p>
          </div>
        )}

        {/* Erro */}
        {state.status === "error" && (
          <div className="flex items-center gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <HugeiconsIcon icon={AlertCircleIcon} size={15} className="shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        {/* Sucesso */}
        {state.status === "success" && (
          <div className="space-y-3">
            {state.warning && (
              <p className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                {state.warning}
              </p>
            )}

            {/* Campo de busca */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <HugeiconsIcon icon={Search01Icon} size={14} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por URL ou título…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none",
                  "transition-colors",
                )}
              />
              {search && (
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                  {filteredLinks.length}/{state.total}
                </span>
              )}
            </div>

            {/* Lista */}
            {filteredLinks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <HugeiconsIcon icon={GlobalIcon} size={20} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma URL encontrada.</p>
              </div>
            ) : (
              <div className="max-h-[440px] overflow-y-auto rounded-md border border-border divide-y divide-border/60">
                {filteredLinks.map((link, i) => {
                  const { hostname, slug } = parseUrl(link.url)
                  const isRoot = slug === "/"
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                    >
                      {/* Índice */}
                      <span className="w-7 shrink-0 font-mono text-xs text-muted-foreground/40 tabular-nums">
                        {i + 1}
                      </span>

                      {/* Conteúdo */}
                      <div className="min-w-0 flex-1">
                        {/* Título acima */}
                        {link.title && (
                          <p className="truncate text-sm font-medium text-foreground leading-snug">
                            {link.title}
                          </p>
                        )}
                        {/* Hostname primary + slug abaixo */}
                        <p className={cn(
                          "truncate font-mono",
                          link.title ? "mt-0.5 text-xs text-muted-foreground" : "text-sm",
                        )}>
                          {isRoot ? (
                            <span className="italic text-muted-foreground/50">{hostname}/</span>
                          ) : (
                            <>
                              <span className={cn(link.title ? "text-primary/80" : "text-primary")}>{hostname}</span>
                              <span className={cn(link.title ? "text-muted-foreground/70" : "text-foreground")}>{slug}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Ícone de link externo — sempre visível */}
                      <HugeiconsIcon
                        icon={ExternalLink}
                        size={14}
                        className="shrink-0 text-muted-foreground/50"
                      />
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Pesquisas guiadas no Google</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Atalhos prontos para descobrir mais páginas, subdomínios, ofertas parecidas e sinais escondidos sem precisar saber operadores de busca.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {researchQueries.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-border/70 bg-background/70 p-3"
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      item.kind === "ready"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {item.kind === "ready" ? "Pronto" : "Template"}
                  </span>
                </div>

                <div className="rounded border border-border/60 bg-muted/30 px-2.5 py-2">
                  <p className="break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {item.query}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyQuery(item.id, item.query)}
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={12} />
                    {copiedQueryId === item.id ? "Copiado" : "Copiar"}
                  </button>

                  <a
                    href={googleSearchUrl(item.query)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <HugeiconsIcon icon={ExternalLink} size={12} />
                    Abrir no Google
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
