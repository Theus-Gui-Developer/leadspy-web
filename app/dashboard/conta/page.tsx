import { redirect } from "next/navigation"
import Link from "next/link"

import { getMe } from "@/lib/api/get_me"
import { resolvePlanFromId } from "@/lib/api/plan_resolver"
import { PageHeader } from "@/components/layout/page_header"
import { ProfileCard } from "@/components/dashboard/profile_card"
import { InfoField } from "@/components/dashboard/info_field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status_badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldCheck, CrownIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrador",
    customer: "Cliente",
    user: "Usuário",
  }
  return labels[role] ?? role
}

export default async function ContaPage() {
  const result = await getMe()

  if (!result.ok) {
    redirect("/login")
  }

  const { user } = result
  const subscription = user.subscription

  if (!subscription) {
    redirect("/login")
  }

  const plan = resolvePlanFromId(subscription.planId)
  const expiresAt = new Date(subscription.expiresAt)

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Minha Conta"
        description="Informações e configurações da sua conta."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna lateral — perfil */}
        <div>
          <Card className="ring-foreground/10 transition-all duration-200 hover:ring-foreground/20">
            <CardContent className="py-6">
              <ProfileCard
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna principal — informações detalhadas */}
        <div className="space-y-6 lg:col-span-2">
          {/* Seção de informações pessoais */}
          <Card className="ring-foreground/10 transition-all duration-200 hover:ring-foreground/20">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold">
                Informações da conta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoField label="Nome completo" value={user.name} />
                <InfoField label="Email" value={user.email} copyable />
                <InfoField label="Função" value={getRoleLabel(user.role)} />
              </div>
            </CardContent>
          </Card>

          {/* Seção de segurança */}
          <Card className="ring-foreground/10 transition-all duration-200 hover:ring-foreground/20">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={ShieldCheck}
                  size={15}
                  className="text-muted-foreground"
                />
                <CardTitle className="text-sm font-semibold">
                  Segurança
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Senha</p>
                  <p className="font-mono text-sm tracking-widest text-muted-foreground">
                    ••••••••••••
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Em breve"
                  className="shrink-0"
                >
                  Alterar senha
                  <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-xs text-muted-foreground">
                    Em breve
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seção de assinatura — resumo */}
          <Card className="ring-foreground/10 transition-all duration-200 hover:ring-foreground/20">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CrownIcon}
                    size={15}
                    className="text-[#3c83f6]"
                  />
                  <CardTitle className="text-sm font-semibold">
                    Assinatura
                  </CardTitle>
                </div>
                <Link
                  href="/dashboard/assinatura"
                  className="inline-flex items-center gap-1 text-xs text-[#3c83f6] transition-opacity hover:opacity-80"
                >
                  Ver detalhes
                  <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Plano atual
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <StatusBadge status={subscription.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Válido até
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(expiresAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
