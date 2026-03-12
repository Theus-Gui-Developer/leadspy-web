import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldBanIcon } from "@hugeicons/core-free-icons"

export function AccessUnavailableState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      {/* Ícone de escudo com glow neutro */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.56 0.04 255 / 12%)" }}
        />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <HugeiconsIcon
            icon={ShieldBanIcon}
            size={28}
            className="text-muted-foreground"
          />
        </div>
      </div>

      {/* Texto */}
      <div className="max-w-sm space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Acesso indisponível
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Você não tem permissão para acessar este recurso. Se acredita que isso
          é um erro, entre em contato com o suporte.
        </p>
      </div>

      {/* Instrução */}
      <p className="max-w-xs text-xs text-muted-foreground/60">
        Nossa equipe de suporte está disponível para ajudar a resolver qualquer
        problema de acesso.
      </p>
    </div>
  )
}
