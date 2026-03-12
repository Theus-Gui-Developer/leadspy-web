import { redirect } from "next/navigation"

import { getMe } from "@/lib/api/get_me"
import { resolvePlanFromId } from "@/lib/api/plan_resolver"
import { PageHeader } from "@/components/layout/page_header"
import { MetricCard } from "@/components/dashboard/metric_card"
import { SubscriptionSummaryCard } from "@/components/dashboard/subscription_summary_card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status_badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  CrownIcon,
  Calendar01Icon,
  ChromeIcon,
  Download01Icon,
  ShieldCheck,
} from "@hugeicons/core-free-icons"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getDaysRemaining(expiresAt: Date): number {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getStatusVariant(
  status: string,
): "success" | "warning" | "danger" | "primary" | "default" {
  const map: Record<
    string,
    "success" | "warning" | "danger" | "primary" | "default"
  > = {
    active: "success",
    pending: "primary",
    expired: "danger",
    cancelled: "default",
    refunded: "default",
    chargeback: "danger",
  }
  return map[status] ?? "default"
}

export default async function DashboardPage() {
  const result = await getMe()

  if (!result.ok) {
    redirect("/login")
  }

  const { user } = result
  const subscription = user.subscription
  const firstName = user.name.split(" ")[0]

  if (!subscription) {
    redirect("/login")
  }

  const plan = resolvePlanFromId(subscription.planId)
  const expiresAt = new Date(subscription.expiresAt)
  const daysRemaining = getDaysRemaining(expiresAt)

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Bem-vindo de volta, ${firstName}. Visão geral da sua conta.`}
      />

      {/* Row 1 — Cards de status */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card: Status do Acesso */}
          <MetricCard
            title="Status do Acesso"
            value={
              <StatusBadge status={subscription.status} className="text-sm" />
            }
            description={
              subscription.status === "active"
                ? "Acesso liberado a todos os recursos"
                : "Acesso restrito — verifique sua assinatura"
            }
            icon={<HugeiconsIcon icon={ShieldCheck} size={18} />}
            variant={getStatusVariant(subscription.status)}
          />

          {/* Card: Assinatura */}
          <MetricCard
            title="Assinatura"
            value={plan.name}
            description={`Vence em ${formatDate(expiresAt)}`}
            icon={<HugeiconsIcon icon={CrownIcon} size={18} />}
            variant="primary"
          />

          {/* Card: Dias restantes */}
          <MetricCard
            title="Dias restantes"
            value={`${daysRemaining} dias`}
            description={
              daysRemaining <= 7
                ? "Seu acesso está prestes a vencer"
                : "Você ainda tem bastante tempo de acesso"
            }
            icon={<HugeiconsIcon icon={Calendar01Icon} size={18} />}
            variant={daysRemaining <= 7 ? "warning" : "default"}
          />
        </div>
      </section>

      {/* Row 2 — CTA Extensão Chrome */}
      <section>
        <Card className="overflow-hidden bg-gradient-to-br from-[#0d1321] to-[#151e32] ring-[#3c83f6]/20 transition-all duration-200 hover:shadow-[0_0_32px_-8px_rgba(60,131,246,0.2)] hover:ring-[#3c83f6]/30">
          <CardContent className="py-2">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              {/* Ícone decorativo */}
              <div className="relative shrink-0">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#3c83f6]/10">
                  <HugeiconsIcon
                    icon={ChromeIcon}
                    size={32}
                    className="text-[#3c83f6]"
                  />
                </div>
                {/* Glow decorativo */}
                <div className="absolute inset-0 -z-10 size-16 rounded-2xl bg-[#3c83f6] opacity-10 blur-xl" />
              </div>

              {/* Texto */}
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Extensão LeadSpy para Chrome
                </h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Instale a extensão no Chrome e comece a espionar os anúncios
                  dos seus concorrentes diretamente na Biblioteca de Anúncios do
                  Meta.
                </p>
              </div>

              {/* Botão */}
              <div className="shrink-0">
                <Button
                  disabled
                  size="lg"
                  className="relative gap-2 bg-[#3c83f6]/20 text-[#3c83f6] ring-1 ring-[#3c83f6]/30 hover:bg-[#3c83f6]/30 disabled:opacity-60"
                >
                  <HugeiconsIcon icon={Download01Icon} size={16} />
                  Instalar Extensão
                  <span className="ml-1 rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-muted-foreground">
                    Em breve
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Row 3 — Resumo do plano + conta */}
      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resumo da assinatura */}
          <SubscriptionSummaryCard
            subscription={{
              id: subscription.id,
              status: subscription.status,
              expiresAt,
              createdAt: null,
            }}
            plan={plan}
          />

          {/* Card de informações do usuário */}
          <Card className="ring-foreground/10 transition-all duration-200 hover:ring-foreground/20">
            <CardContent className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-foreground/5">
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={18}
                    className="text-muted-foreground"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Minha Conta
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="ml-4 max-w-[200px] truncate text-foreground/80">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Função</span>
                  <span className="text-foreground/80">
                    {user.role === "admin" ? "Administrador" : "Cliente"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="text-foreground/80">{plan.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
