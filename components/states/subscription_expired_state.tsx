import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon } from "@hugeicons/core-free-icons"

export function SubscriptionExpiredState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      {/* Ícone de calendário com glow âmbar */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.76 0.17 65 / 15%)" }}
        />
        <div
          className="relative flex size-14 items-center justify-center rounded-2xl border"
          style={{
            background: "oklch(0.76 0.17 65 / 10%)",
            borderColor: "oklch(0.76 0.17 65 / 25%)",
            boxShadow: "0 0 0 1px oklch(0.76 0.17 65 / 8%)",
          }}
        >
          <HugeiconsIcon
            icon={Calendar01Icon}
            size={28}
            style={{ color: "oklch(0.76 0.17 65)" }}
          />
        </div>
      </div>

      {/* Texto */}
      <div className="max-w-sm space-y-2">
        <h3
          className="text-base font-semibold"
          style={{ color: "oklch(0.82 0.10 65)" }}
        >
          Acesso expirado
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sua assinatura venceu e o acesso ao LeadSpy foi suspenso. Para
          reativar, entre em contato com o suporte ou adquira um novo plano.
        </p>
      </div>

      {/* Instrução de contato */}
      <p className="max-w-xs text-xs text-muted-foreground/70">
        Dúvidas? Entre em contato com nossa equipe de suporte para renovar seu
        acesso.
      </p>
    </div>
  )
}
