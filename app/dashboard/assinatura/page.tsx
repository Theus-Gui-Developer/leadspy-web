import { redirect } from "next/navigation"

import { getMe } from "@/lib/api/get_me"
import { resolvePlanFromId } from "@/lib/api/plan_resolver"
import { PageHeader } from "@/components/layout/page_header"
import { SubscriptionCard } from "@/components/dashboard/subscription_card"
import { PlanFeaturesList } from "@/components/dashboard/plan_features_list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon } from "@hugeicons/core-free-icons"

export default async function AssinaturaPage() {
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

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Assinatura"
        description="Detalhes do seu plano atual e histórico de acesso."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal — card da assinatura */}
        <div className="space-y-6 lg:col-span-2">
            <SubscriptionCard
              subscription={{
                id: subscription.id,
                status: subscription.status,
                expiresAt,
              createdAt: null,
            }}
            plan={plan}
          />
        </div>

        {/* Coluna lateral — features do plano */}
        <div>
          <Card className="ring-foreground/10 transition-all duration-200 hover:ring-foreground/20">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#3c83f6]/10">
                  <HugeiconsIcon
                    icon={CrownIcon}
                    size={14}
                    className="text-[#3c83f6]"
                  />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Recursos inclusos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-2">
              <PlanFeaturesList />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
