"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  Share08Icon,
  Delete02Icon,
  FolderLibraryIcon,
  Link04Icon,
  Globe02Icon,
  Calendar03Icon,
  TextIcon,
  Image02Icon,
  Video02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoveToFolderDialog } from "@/components/saved-ads/move-to-folder-dialog"
import { ShareDialog } from "@/components/saved-ads/share-dialog"
import { AdDetailDialog } from "@/components/saved-ads/ad-detail-dialog"
import type { SavedAd, SavedAdFolder } from "@/components/saved-ads/types"

type SavedAdCardProps = {
  ad: SavedAd
  folders: SavedAdFolder[]
  onDelete: () => void
  onMove: (folderId: string | null) => void
  onShare: () => Promise<string | null>
  onFilterByDomain: (domain: string) => void
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

export function SavedAdCard({
  ad,
  folders,
  onDelete,
  onMove,
  onShare,
  onFilterByDomain,
}: SavedAdCardProps) {
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  // Pré-popula com o token existente para evitar re-geração desnecessária
  const [shareUrl, setShareUrl] = useState<string | null>(() => {
    if (!ad.shareToken) return null
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL ?? ""
    return `${base}/anuncio/${ad.shareToken}`
  })
  const [isSharing, setIsSharing] = useState(false)

  const currentFolder = ad.folderId
    ? folders.find((f) => f.id === ad.folderId)
    : null

  async function handleShareClick() {
    // Se já temos a URL em cache, abre o dialog sem chamar a API novamente
    if (shareUrl) {
      setIsShareOpen(true)
      return
    }

    setIsSharing(true)
    const url = await onShare()
    setShareUrl(url)
    setIsSharing(false)

    if (url) {
      setIsShareOpen(true)
    }
  }

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
    <>
      <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-foreground/10">
        {/* Conteúdo */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Header: Badge de mídia + Anunciante + Ações */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="gap-1 px-1.5 py-0.5 text-[10px]"
                >
                  <HugeiconsIcon icon={getMediaIcon(ad.mediaType)} size={10} />
                  {getMediaLabel(ad.mediaType)}
                </Badge>
              </div>
              <p className="truncate text-sm font-semibold text-foreground">
                {ad.advertiserName ?? "Anunciante desconhecido"}
              </p>
              {ad.domain && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFilterByDomain(ad.domain!)
                  }}
                  className="mt-0.5 flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                  title={`Filtrar por ${ad.domain}`}
                >
                  <HugeiconsIcon icon={Globe02Icon} size={11} />
                  <span className="truncate">{ad.domain}</span>
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 cursor-pointer"
                  />
                }
              >
                <HugeiconsIcon icon={MoreVerticalIcon} size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsDetailOpen(true) }}>
                    <HugeiconsIcon icon={ViewIcon} size={14} className="mr-2" />
                    Ver detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenInLibrary}>
                    <HugeiconsIcon icon={Link04Icon} size={14} className="mr-2" />
                    Abrir na Biblioteca
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsMoveOpen(true)}>
                    <HugeiconsIcon icon={FolderLibraryIcon} size={14} className="mr-2" />
                    Mover para pasta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareClick} disabled={isSharing}>
                    <HugeiconsIcon icon={Share08Icon} size={14} className="mr-2" />
                    {isSharing ? "Gerando link..." : "Compartilhar"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <HugeiconsIcon icon={Delete02Icon} size={14} className="mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Texto do anúncio */}
          <div className="rounded-md bg-muted/30 p-3">
            {ad.adText ? (
              <p className="line-clamp-5 text-xs leading-relaxed text-muted-foreground">
                {ad.adText}
              </p>
            ) : (
              <p className="text-xs italic text-muted-foreground/40">
                Sem texto disponível
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <HugeiconsIcon icon={Calendar03Icon} size={11} />
              {formatDate(ad.savedAt)}
            </div>

            {currentFolder && (
              <Badge variant="outline" className="max-w-[120px] gap-1 truncate text-[10px]">
                <HugeiconsIcon icon={FolderLibraryIcon} size={10} />
                {currentFolder.name}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Diálogos */}
      <MoveToFolderDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        folders={folders}
        currentFolderId={ad.folderId}
        onMove={onMove}
      />

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        shareUrl={shareUrl}
      />

      <AdDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        ad={ad}
        folders={folders}
      />
    </>
  )
}
