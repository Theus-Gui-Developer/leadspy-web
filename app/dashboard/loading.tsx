import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* 3 MetricCards */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="size-7 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Extensão */}
      <section>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="size-16 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-36 rounded-sm shrink-0" />
          </div>
        </div>
      </section>

      {/* Affiliate Banner */}
      <section>
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </section>
    </div>
  )
}
