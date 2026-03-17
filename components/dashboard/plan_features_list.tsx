import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"

const features = [
  "Acesso completo ao dashboard",
  "Extensão Chrome para análise de anúncios",
  "Análise inteligente da Biblioteca de Anúncios",
  "Filtros avançados por criativo",
  "Geração de prompts para ChatGPT",
  "Suporte via email",
]

type PlanFeaturesListProps = {
  className?: string
}

export function PlanFeaturesList({ className }: PlanFeaturesListProps) {
  return (
    <ul className={className} role="list">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-3 py-2">
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={13}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <span className="text-sm text-foreground/80">{feature}</span>
        </li>
      ))}
    </ul>
  )
}
