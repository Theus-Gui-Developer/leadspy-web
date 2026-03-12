import Link from "next/link"

import { HugeiconsIcon } from "@hugeicons/react"
import { LockPasswordIcon } from "@hugeicons/core-free-icons"

export function NotAuthenticatedState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      {/* Ícone de cadeado com glow azul */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.60 0.20 264 / 12%)" }}
        />
        <div
          className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10"
          style={{
            boxShadow: "0 0 0 1px oklch(0.60 0.20 264 / 8%)",
          }}
        >
          <HugeiconsIcon
            icon={LockPasswordIcon}
            size={28}
            className="text-primary"
          />
        </div>
      </div>

      {/* Texto */}
      <div className="max-w-xs space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Sessão expirada
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sua sessão foi encerrada ou expirou. Faça login novamente para
          continuar acessando o dashboard.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/login"
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
      >
        Ir para login
      </Link>
    </div>
  )
}
