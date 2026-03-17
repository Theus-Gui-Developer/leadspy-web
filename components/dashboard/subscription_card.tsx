import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status_badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Clock01Icon, CrownIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"

type SubscriptionCardProps = {
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

function isLifetimePlan(plan: SubscriptionCardProps["plan"], expiresAt: Date | null) {
  return plan.durationMonths === 0 || expiresAt === null
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getProgressColor(status: string, daysRemaining: number | null): string {
  if (status === "expired" || status === "chargeback") return "bg-red-500"
  if (status === "cancelled" || status === "refunded") return "bg-zinc-500"
  if (status === "pending") return "bg-primary"
  if (daysRemaining !== null && daysRemaining <= 7) return "bg-amber-500"
  return "bg-emerald-500"
}

const statusMessages: Record<string, { message: string; color: string }> = {
  active: {
    message: "Sua assinatura está ativa. Aproveite todos os recursos do plano.",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  expired: {
    message: "Sua assinatura expirou. Renove para continuar usando o LeadSpy.",
    color: "text-red-600 dark:text-red-400",
  },
  cancelled: {
    message: "Sua assinatura foi cancelada. Contate o suporte se precisar de ajuda.",
    color: "text-muted-foreground",
  },
  pending: {
    message: "Aguardando confirmação do pagamento. Isso pode levar alguns minutos.",
    color: "text-primary",
  },
  refunded: {
    message: "Sua assinatura foi reembolsada.",
    color: "text-muted-foreground",
  },
  chargeback: {
    message: "Foi identificado um chargeback. Por favor, contate o suporte.",
    color: "text-red-600 dark:text-red-400",
  },
}

export function SubscriptionCard({ subscription, plan }: SubscriptionCardProps) {
  const lifetime = isLifetimePlan(plan, subscription.expiresAt)
  const daysRemaining = subscription.expiresAt ? getDaysRemaining(subscription.expiresAt) : null
  const totalDays = Math.max(plan.durationMonths * 30, 1)
  const progressValue =
    lifetime
      ? 100
      : subscription.status === "active" || subscription.status === "pending"
        ? Math.min(100, ((daysRemaining ?? 0) / totalDays) * 100)
        : 0
  const progressColor = getProgressColor(subscription.status, daysRemaining)
  const isUrgent = !lifetime && (daysRemaining ?? 0) <= 7 && subscription.status === "active"
  const statusInfo = statusMessages[subscription.status] ?? statusMessages.active

  return (
    <Card className={cn(
      "transition-all duration-200",
      isUrgent
        ? "ring-amber-500/30 hover:ring-amber-500/50"
        : "ring-foreground/10 hover:ring-foreground/20"
    )}>
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={CrownIcon} size={20} className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Plano {plan.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {lifetime
                  ? "Vitalicio"
                  : plan.durationMonths === 1
                    ? "Mensal"
                    : `${plan.durationMonths} meses`}
              </p>
            </div>
          </div>
          <StatusBadge status={subscription.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {/* Mensagem de status */}
        <div className="flex items-start gap-2">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={14}
            className={cn("mt-0.5 shrink-0", statusInfo.color)}
          />
          <p className={cn("text-sm", statusInfo.color)}>{statusInfo.message}</p>
        </div>

        <Separator />

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Tempo restante</p>
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                isUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}>
                {lifetime ? "Vitalicio" : `${daysRemaining} dias`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn("h-full rounded-full transition-all", progressColor)}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 dias</span>
            <span>{lifetime ? "Vitalicio" : `${totalDays} dias`}</span>
          </div>
        </div>

        <Separator />

        {/* Grid de datas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/5">
              <HugeiconsIcon icon={Calendar01Icon} size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de ativação</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {subscription.createdAt ? formatDate(subscription.createdAt) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              isUrgent ? "bg-amber-500/10" : "bg-foreground/5"
            )}>
              <HugeiconsIcon
                icon={Clock01Icon}
                size={15}
              className={isUrgent ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Válido até</p>
              <p className={cn(
                "mt-0.5 text-sm font-medium",
              isUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}>
                {subscription.expiresAt ? formatDate(subscription.expiresAt) : "Vitalicio"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Grid de metadados */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Provedor</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">PerfectPay</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plano</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{plan.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-0.5">
              <StatusBadge status={subscription.status} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
