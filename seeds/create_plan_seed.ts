import { createSqlClient } from "./_shared"

const planSeed = {
  slug: "developer",
  name: "Developer",
  description: "Plano interno para uso e testes da equipe LeadSpy.",
  provider: "internal",
  externalCode: "developer",
  durationMonths: 12,
  priceCents: 0,
  currency: "BRL",
  isActive: true,
  features: {
    internal: true,
    dashboardAccess: true,
    support: "internal",
  },
}

async function main() {
  const sql = createSqlClient()

  try {
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
      returning id, slug, name, provider, external_code
    `

    console.log("Plano criado/atualizado com sucesso.")
    console.log(plan)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error("Falha ao executar create_plan_seed.ts")
  console.error(error)
  process.exit(1)
})
