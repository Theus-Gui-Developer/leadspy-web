import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="relative flex items-center justify-center">
          {/* Glow sutil atrás do ícone */}
          <div
            aria-hidden
            className="absolute size-20 rounded-full blur-2xl"
            style={{ background: "oklch(0.60 0.20 264 / 8%)" }}
          />
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground">
            {icon}
          </div>
        </div>
      )}

      <div className="max-w-xs space-y-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
