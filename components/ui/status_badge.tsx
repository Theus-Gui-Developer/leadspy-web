import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Status = "active" | "expired" | "cancelled" | "pending" | "refunded" | "chargeback"

interface StatusConfig {
  label: string
  className: string
}

const statusMap: Record<Status, StatusConfig> = {
  active: {
    label: "Ativo",
    className:
      "border-transparent bg-[oklch(0.72_0.19_142/0.15)] text-[oklch(0.72_0.19_142)] hover:bg-[oklch(0.72_0.19_142/0.2)]",
  },
  expired: {
    label: "Expirado",
    className:
      "border-transparent bg-[oklch(0.56_0.04_255/0.15)] text-[oklch(0.70_0.04_255)] hover:bg-[oklch(0.56_0.04_255/0.2)]",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "border-transparent bg-[oklch(0.63_0.22_27/0.15)] text-[oklch(0.63_0.22_27)] hover:bg-[oklch(0.63_0.22_27/0.2)]",
  },
  pending: {
    label: "Pendente",
    className:
      "border-transparent bg-[oklch(0.76_0.17_65/0.15)] text-[oklch(0.76_0.17_65)] hover:bg-[oklch(0.76_0.17_65/0.2)]",
  },
  refunded: {
    label: "Reembolsado",
    className:
      "border-transparent bg-[oklch(0.60_0.20_264/0.15)] text-[oklch(0.60_0.20_264)] hover:bg-[oklch(0.60_0.20_264/0.2)]",
  },
  chargeback: {
    label: "Chargeback",
    className:
      "border-transparent bg-[oklch(0.63_0.22_27/0.2)] text-[oklch(0.70_0.22_27)] hover:bg-[oklch(0.63_0.22_27/0.3)]",
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status]

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full bg-current opacity-80"
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
export type { Status }
