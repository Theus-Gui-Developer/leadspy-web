import { Skeleton } from "@/components/ui/skeleton"

export default function ContaLoading() {
  return (
    <div className="space-y-8">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-60" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna lateral — perfil */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-1.5 text-center">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-3 w-40 mx-auto" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Coluna principal — 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informações pessoais */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>

          {/* Segurança */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="p-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
