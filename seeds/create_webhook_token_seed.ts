import { createSqlClient, sha256 } from "./_shared"

function buildTokenPreview(rawToken: string) {
  const trimmed = rawToken.trim()

  if (trimmed.length <= 8) {
    return trimmed
  }

  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`
}

const webhookTokenSeed = {
  provider: "perfectpay",
  rawToken: "1cf7dc2d3677e8e0560afecc23f33300",
  ownerCode: null,
  label: "PerfectPay principal",
} as const

const TOKEN_PLACEHOLDER = "COLE_AQUI_O_TOKEN_REAL_DA_PLATAFORMA"

async function main() {
  const sql = createSqlClient()

  try {
    const rawToken = webhookTokenSeed.rawToken.trim()

    if (!rawToken || rawToken === TOKEN_PLACEHOLDER) {
      throw new Error(
        "Preencha `rawToken` em ./web/seeds/create_webhook_token_seed.ts com o token real da plataforma."
      )
    }

    const tokenHash = sha256(rawToken)
    const tokenPreview = buildTokenPreview(rawToken)

    const [token] = await sql`
      insert into webhook_provider_tokens (
        provider,
        owner_code,
        label,
        token_hash,
        token_preview,
        is_active
      )
      values (
        ${webhookTokenSeed.provider},
        ${webhookTokenSeed.ownerCode},
        ${webhookTokenSeed.label},
        ${tokenHash},
        ${tokenPreview},
        true
      )
      on conflict (token_hash)
      do update set
        provider = excluded.provider,
        owner_code = excluded.owner_code,
        label = excluded.label,
        token_preview = excluded.token_preview,
        is_active = true,
        updated_at = now()
      returning id, provider, owner_code, label, token_preview, is_active
    `

    console.log("Token de webhook criado/atualizado com sucesso.")
    console.log(token)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error("Falha ao executar create_webhook_token_seed.ts")
  console.error(error)
  process.exit(1)
})
