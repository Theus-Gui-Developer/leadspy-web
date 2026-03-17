import { Skeleton } from "@/components/ui/skeleton"

export function SavedAdsSkeleton() {
  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* FolderSidebar */}
        <div className="w-full shrink-0 space-y-1 lg:w-60">
          <div className="mb-3 flex items-center justify-between px-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="size-5 rounded-md" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>

        {/* Conteúdo principal */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 min-w-0 flex-1 rounded-md" />
            <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
            <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
            <Skeleton className="h-9 w-[68px] shrink-0 rounded-md" />
          </div>

          {/* Grid de cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-border"
              >
                {/* Thumbnail */}
                <Skeleton className="h-36 w-full rounded-none" />

                {/* Card body */}
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="size-6 shrink-0 rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
