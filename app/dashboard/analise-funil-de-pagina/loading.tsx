import { Skeleton } from "@/components/ui/skeleton"

export default function AnaliseFunilLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Formulário de entrada */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      {/* Estado inicial / resultado */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-6 flex flex-col items-center">
        <Skeleton className="size-16 rounded-2xl" />
        <div className="space-y-2 text-center w-full max-w-sm">
          <Skeleton className="h-5 w-72 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>
        <div className="space-y-2 w-full max-w-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
