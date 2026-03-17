import { Skeleton } from "@/components/ui/skeleton"

export default function AnunciosLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex gap-6">
        {/* Sidebar de pastas */}
        <div className="hidden w-56 shrink-0 space-y-2 md:block">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-6 rounded-md" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>

        {/* Grid de anúncios */}
        <div className="flex-1 space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-full max-w-xs rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card overflow-hidden space-y-0">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
