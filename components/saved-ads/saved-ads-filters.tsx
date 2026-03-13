"use client"

import { useCallback, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FilterIcon,
  SortingIcon,
  Cancel01Icon,
  Globe02Icon,
  LayoutGridIcon,
  ListViewIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { SavedAdsFilters as Filters, ViewMode } from "@/components/saved-ads/types"

type SavedAdsFiltersProps = {
  filters: Filters
  onFilterChange: (partial: Partial<Filters>) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const sortOptions = [
  { value: "", label: "Mais recentes" },
  { value: "savedAt:asc", label: "Mais antigos" },
  { value: "advertiser:asc", label: "Anunciante A-Z" },
  { value: "advertiser:desc", label: "Anunciante Z-A" },
  { value: "domain:asc", label: "Domínio A-Z" },
  { value: "domain:desc", label: "Domínio Z-A" },
]

const mediaTypeOptions = [
  { value: "", label: "Todos os tipos" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "unknown", label: "Outros" },
]

export function SavedAdsFilters({ filters, onFilterChange, viewMode, onViewModeChange }: SavedAdsFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)

      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        onFilterChange({ search: value })
      }, 400)

      setSearchTimeout(timeout)
    },
    [onFilterChange, searchTimeout],
  )

  const activeFilterCount =
    (filters.mediaType ? 1 : 0) + (filters.domain ? 1 : 0)

  const currentSort =
    sortOptions.find((o) => o.value === filters.sort)?.label ?? "Mais recentes"

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Busca */}
      <div className="relative min-w-0 flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por texto, anunciante ou domínio..."
          className="pl-9"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("")
              onFilterChange({ search: "" })
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        )}
      </div>

      {/* Badge de domínio ativo */}
      {filters.domain && (
        <Badge variant="secondary" className="gap-1 pr-1">
          <HugeiconsIcon icon={Globe02Icon} size={11} />
          {filters.domain}
          <button
            type="button"
            onClick={() => onFilterChange({ domain: "" })}
            className="ml-0.5 cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-muted-foreground/20"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={10} />
          </button>
        </Badge>
      )}

      {/* Filtro de tipo de mídia */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="default">
              <HugeiconsIcon icon={FilterIcon} size={14} />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 size-5 justify-center p-0 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tipo de mídia</DropdownMenuLabel>
            {mediaTypeOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onFilterChange({ mediaType: opt.value })}
              >
                {opt.label}
                {filters.mediaType === opt.value && (
                  <span className="ml-auto text-primary">
                    <HugeiconsIcon icon={FilterIcon} size={12} />
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          {filters.domain && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onFilterChange({ domain: "" })}
                variant="destructive"
              >
                Limpar filtro de domínio: {filters.domain}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ordenação */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="default">
              <HugeiconsIcon icon={SortingIcon} size={14} />
              {currentSort}
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            {sortOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onFilterChange({ sort: opt.value })}
              >
                {opt.label}
                {filters.sort === opt.value && (
                  <span className="ml-auto text-primary">
                    <HugeiconsIcon icon={SortingIcon} size={12} />
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toggle de visualização */}
      <div className="flex items-center rounded-md border border-border/60 p-0.5">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => onViewModeChange("grid")}
          className="cursor-pointer"
          title="Visualização em grade"
        >
          <HugeiconsIcon icon={LayoutGridIcon} size={14} />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => onViewModeChange("list")}
          className="cursor-pointer"
          title="Visualização em lista"
        >
          <HugeiconsIcon icon={ListViewIcon} size={14} />
        </Button>
      </div>
    </div>
  )
}
