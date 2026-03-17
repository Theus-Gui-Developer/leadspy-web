import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status_badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Clock01Icon, CrownIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"

type SubscriptionSummaryCardProps = {
  subscription: {
    id: string
    status: "active" | "expired" | "cancelled" | "pending" | "refunded" | "chargeback"
    expiresAt: Date | null
    createdAt?: Date | null
  }
  plan: {
    name: string
    slug: string
    durationMonths: number
  }
}

function getDaysRemaining(expiresAt: Date): number {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getDurationDays(months: number): number {
  return months * 30
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getProgressColor(
  status: string,
  daysRemaining: number | null
): string {
  if (status === "expired" || status === "cancelled" || status === "chargeback") {
    return "bg-red-500"
  }
  if (status === "refunded") {
    return "bg-zinc-500"
  }
  if (status === "pending") {
    return "bg-primary"
  }
  if (daysRemaining !== null && daysRemaining <= 7) {
    return "bg-amber-400"
  }
  return "bg-emerald-500"
}

function isLifetimePlan(plan: SubscriptionSummaryCardProps["plan"], expiresAt: Date | null) {
  return plan.durationMonths === 0 || expiresAt === null
}

export function SubscriptionSummaryCard({ subscription, plan }: SubscriptionSummaryCardProps) {
  const lifetime = isLifetimePlan(plan, subscription.expiresAt)
  const daysRemaining = subscription.expiresAt ? getDaysRemaining(subscription.expiresAt) : null
  const totalDays = Math.max(getDurationDays(plan.durationMonths), 1)
  const progressValue = lifetime
    ? 100
    : subscription.status === "active" || subscription.status === "pending"
      ? Math.min(100, ((daysRemaining ?? 0) / totalDays) * 100)
      : 0
  const progressColor = getProgressColor(subscription.status, daysRemaining)

  const isUrgent = !lifetime && (daysRemaining ?? 0) <= 7 && subscription.status === "active"

  return (
    <Card className={cn(
      "transition-all duration-200",
      isUrgent
        ? "ring-amber-500/30 hover:ring-amber-500/50 hover:shadow-[0_0_24px_-4px_rgba(245,158,11,0.15)]"
        : "ring-foreground/10 hover:ring-foreground/20"
    )}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <HugeiconsIcon icon={CrownIcon} size={16} className="text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">
              Plano {plan.name}
            </CardTitle>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-3">
        {/* Barra de progresso */}
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{lifetime ? "Acesso" : "Dias restantes"}</span>
              <span className={cn("font-medium tabular-nums", isUrgent && "text-amber-600 dark:text-amber-400")}>
                {lifetime ? "Vitalicio" : `${daysRemaining} dias`}
              </span>
            </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn("h-full rounded-full transition-all", progressColor)}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <HugeiconsIcon icon={Calendar01Icon} size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Ativação</p>
              <p className="text-xs font-medium text-foreground">
                {subscription.createdAt ? formatDate(subscription.createdAt) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HugeiconsIcon icon={Clock01Icon} size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Vencimento</p>
              <p className={cn("text-xs font-medium", isUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
                {subscription.expiresAt ? formatDate(subscription.expiresAt) : "Vitalicio"}
              </p>
            </div>
          </div>
        </div>

        {/* Link */}
        <Link
          href="/dashboard/assinatura"
          className="inline-flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-80"
        >
          Ver detalhes da assinatura
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      </CardContent>
    </Card>
  )
}
