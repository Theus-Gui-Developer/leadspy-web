import { createSqlClient, hashPassword } from "./_shared"

const userSeed = {
  name: "Matheus",
  email: "theus.gui.developer@gmail.com",
  password: "LeadSpy@123456",
  role: "admin" as const,
}

async function main() {
  const sql = createSqlClient()

  try {
    const passwordHash = hashPassword(userSeed.password)
    const now = new Date()

    const [user] = await sql`
      insert into users (name, email, password_hash, role, password_updated_at)
      values (
        ${userSeed.name},
        ${userSeed.email},
        ${passwordHash},
        ${userSeed.role},
        ${now}
      )
      on conflict (email)
      do update set
        name = excluded.name,
        password_hash = excluded.password_hash,
        role = excluded.role,
        password_updated_at = excluded.password_updated_at,
        updated_at = now()
      returning id, name, email, role
    `

    console.log("Usuario criado/atualizado com sucesso.")
    console.log(user)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error("Falha ao executar create_user_seed.ts")
  console.error(error)
  process.exit(1)
})
