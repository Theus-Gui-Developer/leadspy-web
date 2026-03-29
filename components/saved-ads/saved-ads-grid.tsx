"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  AdvertisimentIcon,
  Globe02Icon,
  Calendar03Icon,
  FolderLibraryIcon,
  Image02Icon,
  Video02Icon,
  TextIcon,
  MoreVerticalIcon,
  Link04Icon,
  Share08Icon,
  Delete02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/states/empty_state"
import { SavedAdCard } from "@/components/saved-ads/saved-ad-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  SavedAd,
  SavedAdFolder,
  ViewMode,
} from "@/components/saved-ads/types"
import { useState } from "react"
import { AdDetailDialog } from "@/components/saved-ads/ad-detail-dialog"
import { MoveToFolderDialog } from "@/components/saved-ads/move-to-folder-dialog"
import { ShareDialog } from "@/components/saved-ads/share-dialog"

type SavedAdsGridProps = {
  ads: SavedAd[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  folders: SavedAdFolder[]
  viewMode: ViewMode
  onPageChange: (page: number) => void
  onDeleteAd: (adId: string) => void
  onMoveAd: (adId: string, folderId: string | null) => void
  onShareAd: (adId: string) => Promise<string | null>
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

// ─── Row de lista ────────────────────────────────────────────────────────────

type ListRowProps = {
  ad: SavedAd
  folders: SavedAdFolder[]
  onDelete: () => void
  onShare: () => Promise<string | null>
  onMove: (folderId: string | null) => void
  onFilterByDomain: (domain: string) => void
  onOpenDetail: () => void
}

function SavedAdListRow({
  ad,
  folders,
  onDelete,
  onShare,
  onMove,
  onFilterByDomain,
  onOpenDetail,
}: ListRowProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(() => {
    if (!ad.shareToken) return null
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL ?? "")
    return `${base}/anuncio/${ad.shareToken}`
  })

  const currentFolder = ad.folderId
    ? folders.find((f) => f.id === ad.folderId)
    : null

  async function handleShareClick(e: React.MouseEvent) {
    e.stopPropagation()
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

  function handleOpenInLibrary(e: React.MouseEvent) {
    e.stopPropagation()
    const url =
      ad.libraryUrl ??
      (ad.adId ? `https://www.facebook.com/ads/library/?id=${ad.adId}` : null)
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border border-border/40 bg-card px-3 py-2.5 transition-colors hover:bg-accent/30">
        {/* Ícone do tipo de mídia */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
          <HugeiconsIcon
            icon={getMediaIcon(ad.mediaType)}
            size={14}
            className="text-muted-foreground/60"
          />
        </div>

        {/* Anunciante + domínio */}
        <div className="w-40 min-w-0 shrink-0">
          <p className="truncate text-sm font-medium text-foreground">
            {ad.advertiserName ?? "—"}
          </p>
          {ad.domain && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFilterByDomain(ad.domain!)
              }}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <HugeiconsIcon icon={Globe02Icon} size={10} />
              <span className="truncate">{ad.domain}</span>
            </button>
          )}
        </div>

        {/* Texto truncado — ocupa o espaço restante */}
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {ad.adText ?? <span className="italic opacity-50">Sem texto</span>}
        </p>

        {/* Data */}
        <div
          className={cn(
            "hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex"
          )}
        >
          <HugeiconsIcon icon={Calendar03Icon} size={11} />
          {formatDate(ad.savedAt)}
        </div>

        {/* Pasta */}
        {currentFolder && (
          <Badge
            variant="outline"
            className="hidden shrink-0 gap-1 text-[10px] md:flex"
          >
            <HugeiconsIcon icon={FolderLibraryIcon} size={10} />
            {currentFolder.name}
          </Badge>
        )}

        {/* Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-1 shrink-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            }
          >
            <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenDetail()
                }}
              >
                <HugeiconsIcon icon={ViewIcon} size={14} className="mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenInLibrary}>
                <HugeiconsIcon icon={Link04Icon} size={14} className="mr-2" />
                Abrir na Biblioteca
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMoveOpen(true)
                }}
              >
                <HugeiconsIcon
                  icon={FolderLibraryIcon}
                  size={14}
                  className="mr-2"
                />
                Mover para pasta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareClick} disabled={isSharing}>
                <HugeiconsIcon icon={Share08Icon} size={14} className="mr-2" />
                {isSharing ? "Gerando link..." : "Compartilhar"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} className="mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
    </>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function SavedAdsGrid({
  ads,
  pagination,
  folders,
  viewMode,
  onPageChange,
  onDeleteAd,
  onMoveAd,
  onShareAd,
  onFilterByDomain,
}: SavedAdsGridProps) {
  const [detailAd, setDetailAd] = useState<SavedAd | null>(null)

  if (ads.length === 0) {
    return (
      <EmptyState
        icon={
          <HugeiconsIcon
            icon={AdvertisimentIcon}
            size={32}
            className="text-muted-foreground"
          />
        }
        title="Nenhum anúncio encontrado"
        description="Salve anúncios pela extensão do Chrome na Biblioteca de Anúncios do Facebook."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {ads.map((ad) => (
              <SavedAdCard
                key={ad.id}
                ad={ad}
                folders={folders}
                onDelete={() => onDeleteAd(ad.id)}
                onMove={(folderId) => onMoveAd(ad.id, folderId)}
                onShare={() => onShareAd(ad.id)}
                onFilterByDomain={onFilterByDomain}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {ads.map((ad) => (
              <SavedAdListRow
                key={ad.id}
                ad={ad}
                folders={folders}
                onDelete={() => onDeleteAd(ad.id)}
                onMove={(folderId) => onMoveAd(ad.id, folderId)}
                onShare={() => onShareAd(ad.id)}
                onFilterByDomain={onFilterByDomain}
                onOpenDetail={() => setDetailAd(ad)}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              de {pagination.total} anúncios
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
              </Button>

              <span className="px-3 text-sm text-muted-foreground tabular-nums">
                {pagination.page} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhe (usado pela list view) */}
      <AdDetailDialog
        open={detailAd !== null}
        onOpenChange={(open) => {
          if (!open) setDetailAd(null)
        }}
        ad={detailAd}
        folders={folders}
      />
    </>
  )
}
