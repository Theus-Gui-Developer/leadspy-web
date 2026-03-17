import { redirect } from "next/navigation"
import Link from "next/link"

import { AffiliateBanner } from "@/components/dashboard/affiliate-banner"
import { getMe } from "@/lib/api/get_me"
import { resolvePlanFromId } from "@/lib/api/plan_resolver"
import { PageHeader } from "@/components/layout/page_header"
import { MetricCard } from "@/components/dashboard/metric_card"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status_badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
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

function isLifetimeSubscription(expiresAt: string | null): boolean {
  return expiresAt === null
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
  const isLifetime = isLifetimeSubscription(subscription.expiresAt)
  const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null
  const daysRemaining = expiresAt ? getDaysRemaining(expiresAt) : null

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
            description={
              isLifetime || !expiresAt
                ? "Acesso vitalicio sem data de expiracao"
                : `Vence em ${formatDate(expiresAt)}`
            }
            icon={<HugeiconsIcon icon={CrownIcon} size={18} />}
            variant="primary"
          />

          {/* Card: Dias restantes */}
          <MetricCard
            title={isLifetime ? "Acesso" : "Dias restantes"}
            value={isLifetime ? "Vitalicio" : `${daysRemaining} dias`}
            description={
              isLifetime || daysRemaining === null
                ? "Seu acesso nao possui vencimento"
                : daysRemaining <= 7
                  ? "Seu acesso esta prestes a vencer"
                  : "Voce ainda tem bastante tempo de acesso"
            }
            icon={<HugeiconsIcon icon={Calendar01Icon} size={18} />}
            variant={
              isLifetime || daysRemaining === null
                ? "success"
                : daysRemaining <= 7
                  ? "warning"
                  : "default"
            }
          />
        </div>
      </section>

      {/* Row 2 — CTA Extensão Chrome */}
      <section>
        <Card className="overflow-hidden bg-gradient-to-br from-secondary to-card ring-primary/20 transition-all duration-200 hover:shadow-lg hover:ring-primary/30">
          <CardContent className="py-2">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              {/* Ícone decorativo */}
              <div className="relative shrink-0">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                  <HugeiconsIcon
                    icon={ChromeIcon}
                    size={32}
                    className="text-primary"
                  />
                </div>
                {/* Glow decorativo */}
                <div className="absolute inset-0 -z-10 size-16 rounded-2xl bg-primary opacity-10 blur-xl" />
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
                <Link
                  href="/downloads/leadspy-v1.1.0-release.zip"
                  download
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-primary/20 px-4 text-sm font-medium text-primary ring-1 ring-primary/30 transition-all hover:bg-primary/30"
                >
                  <HugeiconsIcon icon={Download01Icon} size={16} />
                  Baixar Extensao
                </Link>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:ml-[5.5rem]">
              Baixe o pacote ZIP e carregue a extensao manualmente em{" "}
              <code>chrome://extensions</code> usando a opcao de desenvolvedor.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Row 3 — Banner Afiliados */}
      <section>
        <AffiliateBanner />
      </section>
    </div>
  )
}
