import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

type AuthCardProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  badge?: string
  action?: ReactNode
  className?: string
}

export function AuthCard({
  children,
  title,
  subtitle,
  badge,
  action,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl",
        // Borda adaptada ao tema
        "border border-border/50",
        // Fundo com glassmorphism — usa --card que já troca por tema
        "bg-card/90 backdrop-blur-xl",
        // Sombra suave em light, profunda em dark
        "shadow-[0_8px_32px_oklch(0_0_0/10%),0_2px_8px_oklch(0_0_0/6%)] dark:shadow-[0_32px_80px_oklch(0_0_0/50%),0_8px_32px_oklch(0_0_0/30%)]",
        className
      )}
      style={{
        boxShadow:
          "var(--auth-card-shadow, 0 8px 32px oklch(0 0 0 / 10%), 0 2px 8px oklch(0 0 0 / 6%), inset 0 1px 0 oklch(1 0 0 / 5%))",
      }}
    >
      {/* Glow decorativo no topo do card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklch, var(--primary) 50%, transparent), transparent)",
        }}
      />

      <div className="p-8">
        {(badge || title || subtitle || action) && (
          <div className="mb-8 space-y-2.5">
            {/* Linha do badge com action no lado direito */}
            {(badge || action) && (
              <div className="flex items-center justify-between gap-3">
                {badge ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-primary opacity-80"
                    />
                    {badge}
                  </span>
                ) : (
                  <span />
                )}
                {action && <div className="-mr-1 shrink-0">{action}</div>}
              </div>
            )}
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
