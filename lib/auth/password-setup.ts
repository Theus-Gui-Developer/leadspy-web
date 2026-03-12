import "server-only"

import { randomBytes } from "node:crypto"
import { createElement } from "react"

import { and, eq, gt, isNull, ne } from "drizzle-orm"

import { PasswordSetupEmail } from "@/emails/password-setup-email"
import { db } from "@/lib/db"
import { passwordSetupTokens, subscriptions, users } from "@/lib/db/schema"
import { getResendClient, getResendFromEmail } from "@/lib/email/resend"
import { env } from "@/lib/env"
import { hashPassword, validatePassword } from "@/lib/security/password"
import { sha256 } from "@/lib/security/hash"

type PasswordSetupTokenState =
  | {
      status: "valid"
      email: string
      name: string | null
      expiresAt: Date
    }
  | {
      status: "invalid" | "expired" | "used"
    }

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeName(name?: string | null) {
  const normalized = name?.trim()
  return normalized ? normalized : null
}

function fallbackNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "cliente"
  return localPart.replace(/[._-]+/g, " ").trim() || "Cliente"
}

function createRawSetupToken() {
  return randomBytes(32).toString("hex")
}

function getTokenExpirationDate() {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + env.PASSWORD_SETUP_TOKEN_TTL_HOURS)
  return expiresAt
}

export function buildPasswordSetupUrl(rawToken: string) {
  const appUrl = (env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")
  return `${appUrl}/definir-senha/${rawToken}`
}

export async function issuePasswordSetupToken(params: {
  email: string
  name?: string | null
  subscriptionId?: string | null
}) {
  const email = normalizeEmail(params.email)
  const name = normalizeName(params.name)
  const now = new Date()

  const [existingPendingToken] = await db
    .select({ id: passwordSetupTokens.id })
    .from(passwordSetupTokens)
    .where(
      and(
        eq(passwordSetupTokens.email, email),
        params.subscriptionId
          ? eq(passwordSetupTokens.subscriptionId, params.subscriptionId)
          : isNull(passwordSetupTokens.subscriptionId),
        isNull(passwordSetupTokens.usedAt),
        isNull(passwordSetupTokens.revokedAt),
        gt(passwordSetupTokens.expiresAt, now),
      ),
    )
    .limit(1)

  if (existingPendingToken) {
    return {
      created: false,
      reason: "Ja existe um link ativo para este email.",
    } as const
  }

  const rawToken = createRawSetupToken()
  const tokenHash = sha256(rawToken)
  const expiresAt = getTokenExpirationDate()

  const [createdToken] = await db
    .insert(passwordSetupTokens)
    .values({
      email,
      name,
      subscriptionId: params.subscriptionId ?? null,
      tokenHash,
      expiresAt,
      metadata: {
        source: "perfectpay_webhook",
      },
    })
    .returning({ id: passwordSetupTokens.id })

  return {
    created: true,
    id: createdToken.id,
    rawToken,
    expiresAt,
    email,
    name,
  } as const
}

export async function sendPasswordSetupEmail(params: {
  email: string
  name?: string | null
  rawToken: string
}) {
  const resend = getResendClient()
  const from = getResendFromEmail()
  const actionUrl = buildPasswordSetupUrl(params.rawToken)

  const response = await resend.emails.send({
    from,
    to: [params.email],
    subject: "Defina sua senha de acesso ao LeadSpy",
    react: createElement(PasswordSetupEmail, {
      actionUrl,
      customerName: params.name,
      expiresInHours: env.PASSWORD_SETUP_TOKEN_TTL_HOURS,
    }),
  })

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response
}

export async function getPasswordSetupTokenState(
  rawToken: string,
): Promise<PasswordSetupTokenState> {
  const tokenHash = sha256(rawToken)

  const [tokenRecord] = await db
    .select({
      email: passwordSetupTokens.email,
      name: passwordSetupTokens.name,
      expiresAt: passwordSetupTokens.expiresAt,
      usedAt: passwordSetupTokens.usedAt,
      revokedAt: passwordSetupTokens.revokedAt,
    })
    .from(passwordSetupTokens)
    .where(eq(passwordSetupTokens.tokenHash, tokenHash))
    .limit(1)

  if (!tokenRecord) {
    return { status: "invalid" }
  }

  if (tokenRecord.usedAt || tokenRecord.revokedAt) {
    return { status: "used" }
  }

  if (tokenRecord.expiresAt <= new Date()) {
    return { status: "expired" }
  }

  return {
    status: "valid",
    email: tokenRecord.email,
    name: tokenRecord.name,
    expiresAt: tokenRecord.expiresAt,
  }
}

export async function consumePasswordSetupToken(params: {
  rawToken: string
  name?: string
  password: string
}) {
  const passwordError = validatePassword(params.password)

  if (passwordError) {
    return {
      ok: false,
      status: 400,
      message: passwordError,
    } as const
  }

  const tokenHash = sha256(params.rawToken)
  const now = new Date()

  return db.transaction(async (tx) => {
    const [tokenRecord] = await tx
      .select({
        id: passwordSetupTokens.id,
        email: passwordSetupTokens.email,
        name: passwordSetupTokens.name,
        expiresAt: passwordSetupTokens.expiresAt,
        usedAt: passwordSetupTokens.usedAt,
        revokedAt: passwordSetupTokens.revokedAt,
      })
      .from(passwordSetupTokens)
      .where(eq(passwordSetupTokens.tokenHash, tokenHash))
      .limit(1)

    if (!tokenRecord) {
      return {
        ok: false,
        status: 404,
        message: "Link invalido.",
      } as const
    }

    if (tokenRecord.usedAt || tokenRecord.revokedAt) {
      return {
        ok: false,
        status: 410,
        message: "Este link ja foi utilizado.",
      } as const
    }

    if (tokenRecord.expiresAt <= now) {
      return {
        ok: false,
        status: 410,
        message: "Este link expirou.",
      } as const
    }

    const name =
      normalizeName(params.name) ??
      normalizeName(tokenRecord.name) ??
      fallbackNameFromEmail(tokenRecord.email)

    const passwordHash = hashPassword(params.password)

    const [existingUser] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, tokenRecord.email))
      .limit(1)

    const [savedUser] = existingUser
      ? await tx
          .update(users)
          .set({
            name,
            passwordHash,
            passwordUpdatedAt: now,
          })
          .where(eq(users.id, existingUser.id))
          .returning({ id: users.id, email: users.email, name: users.name })
      : await tx
          .insert(users)
          .values({
            name,
            email: tokenRecord.email,
            passwordHash,
            passwordUpdatedAt: now,
          })
          .returning({ id: users.id, email: users.email, name: users.name })

    await tx
      .update(passwordSetupTokens)
      .set({
        usedAt: now,
        userId: savedUser.id,
        name,
      })
      .where(eq(passwordSetupTokens.id, tokenRecord.id))

    await tx
      .update(passwordSetupTokens)
      .set({
        revokedAt: now,
      })
      .where(
        and(
          eq(passwordSetupTokens.email, tokenRecord.email),
          ne(passwordSetupTokens.id, tokenRecord.id),
          isNull(passwordSetupTokens.usedAt),
          isNull(passwordSetupTokens.revokedAt),
        ),
      )

    await tx
      .update(subscriptions)
      .set({ userId: savedUser.id })
      .where(
        and(
          eq(subscriptions.customerEmail, tokenRecord.email),
          isNull(subscriptions.userId),
        ),
      )

    return {
      ok: true,
      status: 200,
      email: savedUser.email,
      name: savedUser.name,
    } as const
  })
}
