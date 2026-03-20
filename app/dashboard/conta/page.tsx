import { redirect } from "next/navigation"
import Link from "next/link"

import { getMe } from "@/lib/api/get_me"
import { resolvePlanFromId } from "@/lib/api/plan_resolver"
import { getDaysRemaining } from "@/lib/utils"
import { AccountPasswordForm } from "@/components/dashboard/account-password-form"
import { AccountProfileForm } from "@/components/dashboard/account-profile-form"
import { PageHeader } from "@/components/layout/page_header"
import { ProfileCard } from "@/components/dashboard/profile_card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status_badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShieldCheck,
  CrownIcon,
  ArrowRight01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
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
  const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null
  const isLifetime = subscription.expiresAt === null
  const daysRemaining = expiresAt ? getDaysRemaining(expiresAt) : null

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
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={15}
                  className="text-muted-foreground"
                />
                <CardTitle className="text-sm font-semibold">
                  Informações da conta
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <AccountProfileForm initialName={user.name} email={user.email} />
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
              <AccountPasswordForm email={user.email} />
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
                    {expiresAt ? formatDate(expiresAt) : "Vitalício"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dias restantes
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {isLifetime ? "Vitalício" : `${daysRemaining} dias`}
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
