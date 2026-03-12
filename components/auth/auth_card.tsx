import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

type AuthCardProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  badge?: string
  className?: string
}

export function AuthCard({
  children,
  title,
  subtitle,
  badge,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl",
        // Borda sutil com glow no topo
        "border border-white/[0.08]",
        // Fundo com glassmorphism
        "bg-[oklch(0.11_0.025_255/85%)] backdrop-blur-xl",
        // Sombra profunda
        "shadow-[0_32px_80px_oklch(0_0_0/50%),0_8px_32px_oklch(0_0_0/30%)]",
        className
      )}
      style={{
        // Glow sutil na borda superior
        boxShadow:
          "0 32px 80px oklch(0 0 0 / 50%), 0 8px 32px oklch(0 0 0 / 30%), inset 0 1px 0 oklch(1 0 0 / 8%)",
      }}
    >
      {/* Glow decorativo no topo do card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.60 0.20 264 / 50%), transparent)",
        }}
      />

      <div className="p-8">
        {(badge || title || subtitle) && (
          <div className="mb-8 space-y-2.5">
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-primary opacity-80"
                />
                {badge}
              </span>
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
