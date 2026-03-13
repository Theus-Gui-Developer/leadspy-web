import { createSqlClient } from "./_shared"

const planSeeds = [
  {
    slug: "leadspy-semestral",
    name: "Semestral",
    description: "Plano semestral do LeadSpy via PerfectPay.",
    provider: "perfectpay",
    externalCode: "PPLQQOTTO",
    durationMonths: 6,
    priceCents: 0,
    currency: "BRL",
    isActive: true,
    features: {
      checkoutUrl: "https://go.perfectpay.com.br/PPU38CQ8SQT",
      billingCycle: "semiannual",
      dashboardAccess: true,
    },
  },
  {
    slug: "leadspy-anual",
    name: "Anual",
    description: "Plano anual do LeadSpy via PerfectPay.",
    provider: "perfectpay",
    externalCode: "PPLQQOTTQ",
    durationMonths: 12,
    priceCents: 0,
    currency: "BRL",
    isActive: true,
    features: {
      checkoutUrl: "https://go.perfectpay.com.br/PPU38CQ8SR0",
      billingCycle: "annual",
      dashboardAccess: true,
    },
  },
  {
    slug: "leadspy-vitalicio",
    name: "Vitalicio",
    description: "Plano vitalicio do LeadSpy via PerfectPay.",
    provider: "perfectpay",
    externalCode: "PPLQQOTTR",
    durationMonths: 0,
    priceCents: 0,
    currency: "BRL",
    isActive: true,
    features: {
      checkoutUrl: "https://go.perfectpay.com.br/PPU38CQ8SR1",
      billingCycle: "lifetime",
      lifetime: true,
      dashboardAccess: true,
    },
  },
] as const

async function main() {
  const sql = createSqlClient()

  try {
    const plans = []

    for (const planSeed of planSeeds) {
      const [plan] = await sql`
        insert into plans (
          slug,
          name,
          description,
          provider,
          external_code,
          duration_months,
          price_cents,
          currency,
          is_active,
          features
        )
        values (
          ${planSeed.slug},
          ${planSeed.name},
          ${planSeed.description},
          ${planSeed.provider},
          ${planSeed.externalCode},
          ${planSeed.durationMonths},
          ${planSeed.priceCents},
          ${planSeed.currency},
          ${planSeed.isActive},
          ${sql.json(planSeed.features)}
        )
        on conflict (provider, external_code)
        do update set
          slug = excluded.slug,
          name = excluded.name,
          description = excluded.description,
          duration_months = excluded.duration_months,
          price_cents = excluded.price_cents,
          currency = excluded.currency,
          is_active = excluded.is_active,
          features = excluded.features,
          updated_at = now()
        returning id, slug, name, provider, external_code, duration_months
      `

      plans.push(plan)
    }

    console.log("Planos criados/atualizados com sucesso.")
    console.table(plans)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error("Falha ao executar create_plan_seed.ts")
  console.error(error)
  process.exit(1)
})
