"use client"

import { useRef, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight03Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  GlobalIcon,
  ShoppingCart01Icon,
  Tag01Icon,
  AtIcon,
  ExternalLink,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { FunnelAnalysisResult } from "@/lib/funnel-analysis/types"

export type { FunnelAnalysisResult }

// ---------------------------------------------------------------------------
// Sub-componentes utilitários
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </p>
  )
}

function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "platform" | "type" | "signal" | "subdomain"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-secondary text-muted-foreground",
        variant === "platform" && "bg-primary/10 text-primary",
        variant === "type" && "border border-border bg-muted text-foreground",
        variant === "signal" && "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        variant === "subdomain" && "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Card expansível — detecta overflow real com ResizeObserver
// ---------------------------------------------------------------------------

function ExpandableCard({
  children,
  className,
  maxHeight = 268,
}: {
  children: React.ReactNode
  className?: string
  maxHeight?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    function check() {
      if (el) setOverflows(el.scrollHeight > el.clientHeight + 4)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Área com altura limitada */}
      <div
        ref={innerRef}
        className="overflow-hidden transition-[max-height] duration-200"
        style={{ maxHeight: expanded ? 9999 : maxHeight }}
      >
        <CardContent className="p-4 space-y-3">
          {children}
        </CardContent>
      </div>

      {/* Botão "Ver mais" — só aparece se houver overflow */}
      {overflows && !expanded && (
        <div className="relative">
          {/* Fade sobre o conteúdo cortado */}
          <div className="pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-t from-card to-transparent" />
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-border/50 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
            Ver mais
          </button>
        </div>
      )}

      {/* Botão "Ver menos" */}
      {expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border/50 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowUp01Icon} size={12} />
          Ver menos
        </button>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function FunnelResultCard({ result }: { result: FunnelAnalysisResult }) {
  console.log("[FunnelResultCard] renderizando — ogImage:", result.ogImage, "| images:", result.images.length)
  const hasRedirect = result.finalUrl !== result.initialUrl
  const hasCheckouts = result.checkoutLinks.length > 0
  const hasSubdomains = result.linkedSubdomains.length > 0
  const hasExternalDomains = result.externalDomains.length > 0
  const hasRedirects = result.redirectChain.length > 0
  const hasOgPreview = !!(result.ogImage || result.pageTitle || result.ogDescription)

  return (
    <div className="space-y-3">

      {/* ─── Preview OG — full width ────────────────────────────────────────── */}
      {hasOgPreview && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {result.ogImage && (
              <a href={result.ogImage} target="_blank" rel="noopener noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.ogImage}
                  alt="Open Graph preview"
                  className="w-full max-h-[220px] object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              </a>
            )}
            <div className="px-4 py-3 space-y-0.5">
              {result.pageTitle && (
                <p className="text-sm font-semibold text-foreground leading-snug">{result.pageTitle}</p>
              )}
              {result.ogDescription && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{result.ogDescription}</p>
              )}
              <p className="font-mono text-[11px] text-muted-foreground/50 pt-0.5">{result.rootDomain}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── 3 cards lado a lado ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-start">

        {/* Card 1 — URL + redirect + slugs */}
        <ExpandableCard>
          <SectionLabel>URL analisada</SectionLabel>
          <a
            href={result.initialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-1.5 break-all font-mono text-sm text-foreground transition-colors hover:text-primary"
          >
            <span>{result.initialUrl}</span>
            <HugeiconsIcon
              icon={ExternalLink}
              size={11}
              className="mt-0.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-80"
            />
          </a>

          {hasRedirect && (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/5 px-2.5 py-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70">
                Redirecionou para
              </p>
              <a
                href={result.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-xs text-amber-700 dark:text-amber-300 hover:underline"
              >
                {result.finalUrl}
              </a>
            </div>
          )}

          {result.slugs.length > 0 && (
            <div>
              <SectionLabel>Segmentos da URL</SectionLabel>
              <div className="flex flex-wrap gap-1">
                {result.slugs.map((slug, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    <span className="opacity-40">/</span>{slug}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ExpandableCard>

        {/* Card 2 — Domínio / tipo / idioma */}
        <ExpandableCard>
          <div>
            <SectionLabel>Domínio raiz</SectionLabel>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={GlobalIcon} size={14} className="shrink-0 text-muted-foreground" />
              <span className="font-mono text-sm font-medium text-foreground">{result.rootDomain}</span>
            </div>
          </div>

          {result.subdomain && (
            <div>
              <SectionLabel>Subdomínio</SectionLabel>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={AtIcon} size={14} className="shrink-0 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">{result.subdomain}</span>
              </div>
            </div>
          )}

          {/* Plataforma — só aparece quando a página está HOSPEDADA na plataforma (URL-based) */}
          {result.platform && (
            <div>
              <SectionLabel>Plataforma</SectionLabel>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Tag01Icon} size={14} className="shrink-0 text-primary" />
                <Chip variant="platform">{result.platform}</Chip>
              </div>
            </div>
          )}

          {result.pageType && (
            <div>
              <SectionLabel>Tipo de página</SectionLabel>
              <Chip variant="type">{result.pageType}</Chip>
            </div>
          )}

          {result.language && (
            <div>
              <SectionLabel>Idioma</SectionLabel>
              <Chip variant="default">{result.language.toUpperCase()}</Chip>
            </div>
          )}

          {result.keywords && (
            <div>
              <SectionLabel>Keywords</SectionLabel>
              <p className="text-xs text-muted-foreground leading-relaxed">{result.keywords}</p>
            </div>
          )}
        </ExpandableCard>

        {/* Card 3 — Checkouts + Sinais */}
        <ExpandableCard>
          {/* Checkouts */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={ShoppingCart01Icon} size={14} className="text-primary" />
                <SectionLabel>Checkouts</SectionLabel>
              </div>
              {hasCheckouts && (
                <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {result.checkoutLinks.length}
                </span>
              )}
            </div>
            {hasCheckouts ? (
              <div className="space-y-1">
                {result.checkoutLinks.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-sm border border-primary/15 bg-primary/5 px-2.5 py-1.5 transition-colors hover:border-primary/30 hover:bg-primary/10"
                  >
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{url}</span>
                    <HugeiconsIcon icon={ExternalLink} size={10} className="shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">Nenhum detectado</p>
            )}
          </div>

          {hasExternalDomains && <div className="border-t border-border/50" />}

          {/* Plataformas externas */}
          {hasExternalDomains && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={LinkSquare02Icon} size={14} className="text-muted-foreground" />
                  <SectionLabel>Plataformas externas</SectionLabel>
                </div>
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {result.externalDomains.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.externalDomains.map((domain) => (
                  <Chip key={domain}>{domain}</Chip>
                ))}
              </div>
            </div>
          )}

        </ExpandableCard>
      </div>

      {/* ─── Extras: subdomínios + redirects ───────────────────────────────── */}
      {(hasSubdomains || hasRedirects) && (
        <Card>
          <CardContent className="divide-y divide-border/50 p-0">
            {hasSubdomains && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <div className="flex items-center gap-1.5 shrink-0">
                  <HugeiconsIcon icon={AtIcon} size={13} className="text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground">Subdomínios linkados</span>
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{result.linkedSubdomains.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.linkedSubdomains.map((sub) => (
                    <a key={sub} href={`https://${sub}`} target="_blank" rel="noopener noreferrer">
                      <Chip variant="subdomain">{sub}</Chip>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {hasRedirects && (
              <div className="px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <HugeiconsIcon icon={ArrowRight03Icon} size={13} className="text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Cadeia de redirecionamentos</span>
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {result.redirectChain.length} hop{result.redirectChain.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ol className="space-y-1">
                  {result.redirectChain.map((url, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted font-mono text-[9px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="break-all font-mono text-xs text-muted-foreground">{url}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
