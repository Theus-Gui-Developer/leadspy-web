"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image01Icon,
  Download01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FunnelAnalysisResult } from "@/lib/funnel-analysis/types"

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function proxyUrl(imageUrl: string): string {
  return `/api/funnel-analysis/images?url=${encodeURIComponent(imageUrl)}`
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function FunnelImagesPanel({ result }: { result: FunnelAnalysisResult }) {
  const images = result.images
  const [open, setOpen] = useState(false)
  const [zipping, setZipping] = useState(false)
  const [zipDone, setZipDone] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  if (images.length === 0) return null

  function markFailed(url: string) {
    setFailedImages((prev) => new Set([...prev, url]))
  }

  async function handleDownloadZip() {
    setZipping(true)
    setZipDone(false)
    try {
      const res = await fetch("/api/funnel-analysis/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: images,
          baseName: result.rootDomain,
        }),
      })

      if (!res.ok) {
        console.error("Falha ao gerar ZIP:", res.status)
        return
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = `${result.rootDomain}-imagens.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
      setZipDone(true)
      setTimeout(() => setZipDone(false), 3000)
    } catch (err) {
      console.error("Erro ao baixar ZIP:", err)
    } finally {
      setZipping(false)
    }
  }

  const visibleImages = images.filter((url) => !failedImages.has(url))

  return (
    <Card>
      <CardContent className="p-5 space-y-4">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <HugeiconsIcon icon={Image01Icon} size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Imagens da Página</p>
              <p className="text-xs text-muted-foreground">
                {visibleImages.length} imagem{visibleImages.length !== 1 ? "ns" : ""} encontrada{visibleImages.length !== 1 ? "s" : ""}
              </p>
            </div>
            <HugeiconsIcon
              icon={open ? ArrowUp01Icon : ArrowDown01Icon}
              size={16}
              className="ml-1 text-muted-foreground"
            />
          </button>

          {/* Botão ZIP — visível sempre */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadZip}
            disabled={zipping}
            className={cn(
              "shrink-0 gap-1.5 text-xs transition-all",
              zipDone && "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            )}
          >
            <HugeiconsIcon icon={PackageIcon} size={13} />
            {zipping ? "Gerando ZIP…" : zipDone ? "ZIP baixado!" : "Baixar tudo (ZIP)"}
          </Button>
        </div>

        {/* Galeria — sempre renderizada; peek com blur quando fechada */}
        <div className="relative">
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              open ? "max-h-[9999px]" : "max-h-[78px]",
            )}
          >
            <div
              className={cn(
                "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 transition-[filter] duration-300",
                !open && "blur-[3px] select-none pointer-events-none",
              )}
            >
              {images.map((url, i) => {
                if (failedImages.has(url)) return null
                return (
                  <div
                    key={url}
                    className="group relative overflow-hidden rounded-md border border-border bg-muted/30"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Imagem ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={() => markFailed(url)}
                      />

                      {/* Overlay com botão de download — aparece no hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <a
                          href={proxyUrl(url)}
                          download
                          className={cn(
                            "flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-900",
                            "transition-transform hover:scale-105 active:scale-95",
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HugeiconsIcon icon={Download01Icon} size={12} />
                          Baixar
                        </a>
                      </div>
                    </div>

                    {/* URL truncada abaixo */}
                    <div className="px-2 py-1.5">
                      <p className="truncate font-mono text-[10px] text-muted-foreground/60">
                        {url.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fade + área clicável quando fechado */}
          {!open && (
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
