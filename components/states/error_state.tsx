import { type ReactNode } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

type ErrorStateProps = {
  title?: string
  description?: string
  action?: ReactNode
  code?: string
  className?: string
}

export function ErrorState({
  title = "Algo deu errado",
  description = "Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.",
  action,
  code,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 py-16 text-center",
        className
      )}
    >
      {/* Ícone de erro com glow vermelho */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.63 0.22 27 / 15%)" }}
        />
        <div
          className="relative flex size-14 items-center justify-center rounded-2xl border"
          style={{
            background: "oklch(0.63 0.22 27 / 10%)",
            borderColor: "oklch(0.63 0.22 27 / 25%)",
          }}
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={28}
            style={{ color: "oklch(0.63 0.22 27)" }}
          />
        </div>
      </div>

      {/* Texto */}
      <div className="max-w-sm space-y-2">
        <h3
          className="text-base font-semibold"
          style={{ color: "oklch(0.75 0.10 27)" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {code && (
          <p className="font-mono text-xs text-muted-foreground/60">
            Código: {code}
          </p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
