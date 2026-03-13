"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page_header"
import { LoadingState } from "@/components/states/loading_state"
import { FolderSidebar } from "@/components/saved-ads/folder-sidebar"
import { SavedAdsGrid } from "@/components/saved-ads/saved-ads-grid"
import { SavedAdsFilters } from "@/components/saved-ads/saved-ads-filters"
import type {
  SavedAd,
  SavedAdFolder,
  FoldersResponse,
  SavedAdsResponse,
  SavedAdsFilters as Filters,
  ViewMode,
} from "@/components/saved-ads/types"

export function SavedAdsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [folders, setFolders] = useState<SavedAdFolder[]>([])
  const [noFolderCount, setNoFolderCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [ads, setAds] = useState<SavedAd[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<Filters>({
    folderId: null,
    search: "",
    domain: "",
    mediaType: "",
    sort: "",
    page: 1,
  })

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/saved-ads/folders")
      const data = (await res.json()) as FoldersResponse

      if (data.ok) {
        setFolders(data.folders)
        setNoFolderCount(data.noFolderCount)
        setTotalCount(data.totalCount)
      }
    } catch {
      toast.error("Erro ao carregar pastas.")
    }
  }, [])

  const fetchAds = useCallback(async (currentFilters: Filters) => {
    try {
      const params = new URLSearchParams()

      if (currentFilters.folderId) {
        params.set("folderId", currentFilters.folderId)
      }
      if (currentFilters.search) {
        params.set("search", currentFilters.search)
      }
      if (currentFilters.domain) {
        params.set("domain", currentFilters.domain)
      }
      if (currentFilters.mediaType) {
        params.set("mediaType", currentFilters.mediaType)
      }
      if (currentFilters.sort) {
        params.set("sort", currentFilters.sort)
      }
      if (currentFilters.page > 1) {
        params.set("page", String(currentFilters.page))
      }

      const url = `/api/saved-ads${params.toString() ? `?${params.toString()}` : ""}`
      const res = await fetch(url)
      const data = (await res.json()) as SavedAdsResponse

      if (data.ok) {
        setAds(data.data)
        setPagination(data.pagination)
      }
    } catch {
      toast.error("Erro ao carregar anúncios.")
    }
  }, [])

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      await Promise.all([fetchFolders(), fetchAds(filters)])
      setIsLoading(false)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading) {
      fetchAds(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleFilterChange = useCallback(
    (partial: Partial<Filters>) => {
      setFilters((prev) => ({
        ...prev,
        ...partial,
        page: partial.page ?? 1,
      }))
    },
    [],
  )

  const handleDeleteAd = useCallback(
    async (adId: string) => {
      try {
        const res = await fetch(`/api/saved-ads/${adId}`, { method: "DELETE" })
        const data = (await res.json()) as { ok: boolean; message?: string }

        if (!res.ok || !data.ok) {
          toast.error(data.message ?? "Erro ao excluir anúncio.")
          return
        }

        toast.success("Anúncio excluído.")
        await Promise.all([fetchFolders(), fetchAds(filters)])
      } catch {
        toast.error("Erro inesperado ao excluir anúncio.")
      }
    },
    [fetchFolders, fetchAds, filters],
  )

  const handleMoveAd = useCallback(
    async (adId: string, folderId: string | null) => {
      try {
        const res = await fetch(`/api/saved-ads/${adId}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId }),
        })
        const data = (await res.json()) as { ok: boolean; message?: string }

        if (!res.ok || !data.ok) {
          toast.error(data.message ?? "Erro ao mover anúncio.")
          return
        }

        toast.success("Anúncio movido.")
        await Promise.all([fetchFolders(), fetchAds(filters)])
      } catch {
        toast.error("Erro inesperado ao mover anúncio.")
      }
    },
    [fetchFolders, fetchAds, filters],
  )

  const handleShareAd = useCallback(async (adId: string) => {
    try {
      const res = await fetch(`/api/saved-ads/${adId}/share`, {
        method: "POST",
      })
      const data = (await res.json()) as {
        ok: boolean
        shareUrl?: string
        message?: string
      }

      if (!res.ok || !data.ok) {
        toast.error(data.message ?? "Erro ao gerar link de compartilhamento.")
        return null
      }

      return data.shareUrl ?? null
    } catch {
      toast.error("Erro inesperado ao compartilhar anúncio.")
      return null
    }
  }, [])

  const handleCreateFolder = useCallback(
    async (name: string) => {
      try {
        const res = await fetch("/api/saved-ads/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        const data = (await res.json()) as { ok: boolean; message?: string }

        if (!res.ok || !data.ok) {
          toast.error(data.message ?? "Erro ao criar pasta.")
          return false
        }

        toast.success("Pasta criada.")
        await fetchFolders()
        return true
      } catch {
        toast.error("Erro inesperado ao criar pasta.")
        return false
      }
    },
    [fetchFolders],
  )

  const handleRenameFolder = useCallback(
    async (folderId: string, name: string) => {
      try {
        const res = await fetch(`/api/saved-ads/folders/${folderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        const data = (await res.json()) as { ok: boolean; message?: string }

        if (!res.ok || !data.ok) {
          toast.error(data.message ?? "Erro ao renomear pasta.")
          return false
        }

        toast.success("Pasta renomeada.")
        await fetchFolders()
        return true
      } catch {
        toast.error("Erro inesperado ao renomear pasta.")
        return false
      }
    },
    [fetchFolders],
  )

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      try {
        const res = await fetch(`/api/saved-ads/folders/${folderId}`, {
          method: "DELETE",
        })
        const data = (await res.json()) as { ok: boolean; message?: string }

        if (!res.ok || !data.ok) {
          toast.error(data.message ?? "Erro ao excluir pasta.")
          return
        }

        toast.success("Pasta excluída. Os anúncios foram movidos para 'Sem pasta'.")

        const wasViewingDeleted = filters.folderId === folderId
        if (wasViewingDeleted) {
          // setFilters triggers the useEffect that re-fetches ads
          setFilters((prev) => ({ ...prev, folderId: null, page: 1 }))
        }

        // Refresh folders; ads are re-fetched by useEffect if folderId changed,
        // otherwise we need to refresh manually to update counts
        await fetchFolders()
        if (!wasViewingDeleted) {
          await fetchAds(filters)
        }
      } catch {
        toast.error("Erro inesperado ao excluir pasta.")
      }
    },
    [fetchFolders, fetchAds, filters],
  )

  if (isLoading) {
    return <LoadingState message="Carregando seus anúncios..." />
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Meus Anúncios"
        description="Gerencie os anúncios que você salvou pela extensão."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar de pastas */}
        <div className="w-full shrink-0 lg:w-60">
          <FolderSidebar
            folders={folders}
            noFolderCount={noFolderCount}
            totalCount={totalCount}
            selectedFolderId={filters.folderId}
            onSelectFolder={(folderId) =>
              handleFilterChange({ folderId })
            }
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="min-w-0 flex-1 space-y-4">
          <SavedAdsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <SavedAdsGrid
            ads={ads}
            pagination={pagination}
            folders={folders}
            viewMode={viewMode}
            onPageChange={(page) => handleFilterChange({ page })}
            onDeleteAd={handleDeleteAd}
            onMoveAd={handleMoveAd}
            onShareAd={handleShareAd}
            onFilterByDomain={(domain) => handleFilterChange({ domain })}
          />
        </div>
      </div>
    </div>
  )
}
