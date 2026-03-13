"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Globe02Icon,
  Calendar03Icon,
  FolderLibraryIcon,
  Link04Icon,
  Image02Icon,
  Video02Icon,
  TextIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SavedAd, SavedAdFolder } from "@/components/saved-ads/types"

type AdDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ad: SavedAd | null
  folders: SavedAdFolder[]
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
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

export function AdDetailDialog({
  open,
  onOpenChange,
  ad,
  folders,
}: AdDetailDialogProps) {
  if (!ad) return null

  const currentFolder = ad.folderId
    ? folders.find((f) => f.id === ad.folderId)
    : null

  const libraryUrl =
    ad.libraryUrl ??
    (ad.adId
      ? `https://www.facebook.com/ads/library/?id=${ad.adId}`
      : null)

  function handleOpenInLibrary() {
    if (libraryUrl) {
      window.open(libraryUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        {/* Thumbnail */}
        {ad.thumbnailUrl ? (
          <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-t-md bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.thumbnailUrl}
              alt={ad.advertiserName ?? "Anúncio"}
              className="size-full object-cover"
            />
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 gap-1 bg-background/80 backdrop-blur-sm"
            >
              <HugeiconsIcon icon={getMediaIcon(ad.mediaType)} size={11} />
              {getMediaLabel(ad.mediaType)}
            </Badge>
          </div>
        ) : (
          <div className="flex h-32 shrink-0 items-center justify-center rounded-t-md bg-muted/20">
            <HugeiconsIcon
              icon={getMediaIcon(ad.mediaType)}
              size={36}
              className="text-muted-foreground/30"
            />
          </div>
        )}

        {/* Conteúdo */}
        <div className="min-w-0 space-y-5 p-6">
          <DialogHeader>
            <DialogTitle className="pr-8 text-base leading-snug">
              {ad.advertiserName ?? "Anunciante desconhecido"}
            </DialogTitle>
          </DialogHeader>

          {/* Metadados em linha */}
          <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {ad.domain && (
              <span className="flex min-w-0 items-center gap-1">
                <HugeiconsIcon icon={Globe02Icon} size={12} className="shrink-0" />
                <span className="truncate">{ad.domain}</span>
              </span>
            )}
            {ad.advertiserLink && (
              <a
                href={ad.advertiserLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 cursor-pointer items-center gap-1 transition-colors hover:text-primary"
              >
                <HugeiconsIcon icon={UserIcon} size={12} />
                Ver perfil
              </a>
            )}
            <span className="flex shrink-0 items-center gap-1">
              <HugeiconsIcon icon={Calendar03Icon} size={12} />
              Salvo em {formatDate(ad.savedAt)}
            </span>
            {currentFolder && (
              <span className="flex shrink-0 items-center gap-1">
                <HugeiconsIcon icon={FolderLibraryIcon} size={12} />
                {currentFolder.name}
              </span>
            )}
          </div>

          {/* Texto completo do anúncio */}
          {ad.adText && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Texto do anúncio
              </p>
              <p className="break-words text-sm leading-relaxed text-foreground">
                {ad.adText}
              </p>
            </div>
          )}

          {/* URL do site anunciado */}
          {ad.siteUrl && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Site destino
              </p>
              <a
                href={ad.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer break-all text-sm text-primary underline-offset-2 hover:underline"
              >
                {ad.siteUrl}
              </a>
            </div>
          )}

          {/* Ação: abrir na biblioteca */}
          {libraryUrl && (
            <div className="border-t border-border/50 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInLibrary}
                className="cursor-pointer gap-2"
              >
                <HugeiconsIcon icon={Link04Icon} size={14} />
                Abrir na Biblioteca de Anúncios
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
