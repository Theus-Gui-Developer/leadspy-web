import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

const features = [
  "URL final após todos os redirecionamentos",
  "Plataforma de vendas detectada (Kiwify, Hotmart, etc.)",
  "Tipo de página (checkout, landing page, upsell…)",
  "Slug, subdomínio e domínio raiz",
  "Sinais de pixel, analytics e ferramentas de rastreio",
]

export function FunnelEmptyState() {
  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      {/* Ícone central */}
      <div className="relative">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <HugeiconsIcon icon={FilterIcon} size={30} className="text-primary" />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-primary opacity-10 blur-2xl" />
      </div>

      {/* Texto */}
      <div className="max-w-md space-y-2">
        <p className="text-base font-semibold text-foreground">
          Cole a URL de destino de um anúncio
        </p>
        <p className="text-sm text-muted-foreground">
          O AdSniper vai rastrear o funil completo, identificar a plataforma,
          o tipo de página e os sinais instalados na página.
        </p>
      </div>

      {/* Lista de capacidades */}
      <ul className="space-y-2 text-left">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Tick02Icon} size={14} className="shrink-0 text-emerald-500" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
