import { addMonths, createSqlClient } from "./_shared"

const assignmentSeed = {
  userEmail: "conceicao.juan02@gmail.com",
  planProvider: "perfectpay",
  planExternalCode: "PPLQQOTTQ",
  status: "active",
  startsAt: new Date(),
}

async function main() {
  const sql = createSqlClient()

  try {
    const [user] = await sql`
      select id, name, email
      from users
      where email = ${assignmentSeed.userEmail}
      limit 1
    `

    if (!user) {
      throw new Error(`Usuario nao encontrado: ${assignmentSeed.userEmail}`)
    }

    const [plan] = await sql`
      select id, name, duration_months, features
      from plans
      where provider = ${assignmentSeed.planProvider}
        and external_code = ${assignmentSeed.planExternalCode}
      limit 1
    `

    if (!plan) {
      throw new Error(
        `Plano nao encontrado: ${assignmentSeed.planProvider}/${assignmentSeed.planExternalCode}`,
      )
    }

    const startsAt = new Date(assignmentSeed.startsAt)
    const isLifetimePlan =
      Boolean(plan.features && typeof plan.features === "object" && plan.features.lifetime) ||
      plan.duration_months === 0
    const expiresAt = isLifetimePlan ? null : addMonths(startsAt, plan.duration_months)

    const [existingSubscription] = await sql`
      select id
      from subscriptions
      where user_id = ${user.id}
        and plan_id = ${plan.id}
      limit 1
    `

    const [subscription] = existingSubscription
      ? await sql`
          update subscriptions
          set
            customer_name = ${user.name},
            customer_email = ${user.email},
            status = ${assignmentSeed.status},
            starts_at = ${startsAt},
            expires_at = ${expiresAt},
            canceled_at = null,
            metadata = ${sql.json({ seeded: true, type: "internal_plan_assignment" })},
            updated_at = now()
          where id = ${existingSubscription.id}
          returning id, user_id, plan_id, status, expires_at
        `
      : await sql`
          insert into subscriptions (
            user_id,
            plan_id,
            customer_name,
            customer_email,
            status,
            starts_at,
            expires_at,
            metadata
          )
          values (
            ${user.id},
            ${plan.id},
            ${user.name},
            ${user.email},
            ${assignmentSeed.status},
            ${startsAt},
            ${expiresAt},
            ${sql.json({ seeded: true, type: "internal_plan_assignment" })}
          )
          returning id, user_id, plan_id, status, expires_at
        `

    console.log("Plano vinculado ao usuario com sucesso.")
    console.log(subscription)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error("Falha ao executar assign_plan_to_user_seed.ts")
  console.error(error)
  process.exit(1)
})
