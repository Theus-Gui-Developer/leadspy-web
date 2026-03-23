"use client"

import { useState } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Globe02Icon,
  Link04Icon,
  UserIcon,
  Image02Icon,
  Video02Icon,
  TextIcon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SaveToAccountButton } from "@/components/shared-ads/save-to-account-button"
import Link from "next/link"

type SharedAd = {
  adId: string
  libraryUrl: string | null
  advertiserName: string | null
  advertiserLink: string | null
  pageId: string | null
  adText: string | null
  siteUrl: string | null
  domain: string | null
  mediaType: string | null
  thumbnailUrl: string | null
  sharedBy: string | null
}

type SharedAdPreviewProps = {
  ad: SharedAd
  shareToken: string
}

function getMediaIcon(mediaType: string | null) {
  switch (mediaType) {
    case "video":
      return Video02Icon
    case "image":
      return Image02Icon
    default:
      return TextIcon
  }
}

function getMediaLabel(mediaType: string | null) {
  switch (mediaType) {
    case "video":
      return "Vídeo"
    case "image":
      return "Imagem"
    default:
      return "Outro"
  }
}

export function SharedAdPreview({ ad, shareToken }: SharedAdPreviewProps) {
  const [isImageError, setIsImageError] = useState(false)

  function handleOpenInLibrary() {
    if (ad.libraryUrl) {
      window.open(ad.libraryUrl, "_blank", "noopener,noreferrer")
    } else if (ad.adId) {
      window.open(
        `https://www.facebook.com/ads/library/?id=${ad.adId}`,
        "_blank",
        "noopener,noreferrer",
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Image
            src="/logo_extended.png"
            alt="AdSniper"
            width={100}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/login")}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="animate-fade-in space-y-6">
          {/* Contexto */}
          {ad.sharedBy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={14} />
              <span>
                Compartilhado por <strong className="text-foreground">{ad.sharedBy}</strong>
              </span>
            </div>
          )}

          {/* Card principal */}
          <Card className="overflow-hidden ring-foreground/10">
            {/* Thumbnail */}
            {ad.thumbnailUrl && !isImageError ? (
              <div className="relative w-full overflow-hidden bg-muted/30">
                <div className="relative aspect-video w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.thumbnailUrl}
                    alt={ad.advertiserName ?? "Anúncio"}
                    className="size-full object-contain"
                    onError={() => setIsImageError(true)}
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute left-3 top-3 gap-1 bg-background/80 backdrop-blur-sm"
                >
                  <HugeiconsIcon icon={getMediaIcon(ad.mediaType)} size={11} />
                  {getMediaLabel(ad.mediaType)}
                </Badge>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center bg-muted/20">
                <HugeiconsIcon
                  icon={getMediaIcon(ad.mediaType)}
                  size={40}
                  className="text-muted-foreground/30"
                />
              </div>
            )}

            {/* Conteúdo do card */}
            <div className="space-y-5 p-6">
              {/* Anunciante */}
              <div className="space-y-1">
                <h1 className="text-xl font-semibold text-foreground">
                  {ad.advertiserName ?? "Anunciante desconhecido"}
                </h1>
                {ad.domain && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={Globe02Icon} size={13} />
                    <span>{ad.domain}</span>
                  </div>
                )}
              </div>

              {/* Texto do anúncio */}
              {ad.adText && (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Texto do anúncio
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {ad.adText}
                  </p>
                </div>
              )}

              {/* Informações adicionais */}
              <div className="grid gap-4 sm:grid-cols-3">
                {ad.adId && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      ID do anúncio
                    </p>
                    <p className="text-sm font-mono text-foreground">{ad.adId}</p>
                  </div>
                )}
                {ad.pageId && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      ID da página
                    </p>
                    <p className="text-sm font-mono text-foreground">{ad.pageId}</p>
                  </div>
                )}
                {ad.siteUrl && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      URL de destino
                    </p>
                    <a
                      href={ad.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-primary hover:underline"
                    >
                      {ad.siteUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-5">
                <Button variant="outline" size="sm" onClick={handleOpenInLibrary}>
                  <HugeiconsIcon icon={Link04Icon} size={14} />
                  Abrir na Biblioteca
                </Button>
                <SaveToAccountButton shareToken={shareToken} />
              </div>
            </div>
          </Card>

          {/* Branding footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Salve e organize anúncios da concorrência com o{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                AdSniper
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
