/**
 * Valor especial para filtrar anúncios sem pasta.
 * O backend trata "none" como isNull(folderId).
 */
export const NO_FOLDER = "none" as const

/**
 * Filtro de pasta: null = todos, "none" = sem pasta, string = id da pasta.
 */
export type FolderFilterId = typeof NO_FOLDER | string | null

export type SavedAd = {
  id: string
  userId: string
  folderId: string | null
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
  metadata: Record<string, unknown> | null
  shareToken: string | null
  savedAt: string
  createdAt: string
  updatedAt: string
}

export type SavedAdFolder = {
  id: string
  name: string
  slug: string
  position: number
  createdAt: string
  adCount: number
}

export type FoldersResponse = {
  ok: boolean
  folders: SavedAdFolder[]
  noFolderCount: number
  totalCount: number
}

export type SavedAdsResponse = {
  ok: boolean
  data: SavedAd[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type SavedAdsFilters = {
  folderId: FolderFilterId
  search: string
  domain: string
  mediaType: string
  sort: string
  page: number
}

export type ViewMode = "grid" | "list"
