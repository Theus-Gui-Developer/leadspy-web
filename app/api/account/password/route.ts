import { NextResponse } from "next/server"

import { and, eq, ne } from "drizzle-orm"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { authSessions, users } from "@/lib/db/schema"
import { hashPassword, validatePassword, verifyPassword } from "@/lib/security/password"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sessao invalida ou expirada.",
      },
      { status: 401 },
    )
  }

  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload JSON invalido.",
      },
      { status: 400 },
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload invalido.",
      },
      { status: 400 },
    )
  }

  const { currentPassword, newPassword } = payload as Record<string, unknown>

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json(
      {
        ok: false,
        message: "Senha atual e nova senha sao obrigatorias.",
      },
      { status: 400 },
    )
  }

  const passwordError = validatePassword(newPassword)

  if (passwordError) {
    return NextResponse.json(
      {
        ok: false,
        message: passwordError,
      },
      { status: 400 },
    )
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, authenticatedUser.userId))
    .limit(1)

  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json(
      {
        ok: false,
        message: "A senha atual informada esta incorreta.",
      },
      { status: 400 },
    )
  }

  if (verifyPassword(newPassword, user.passwordHash)) {
    return NextResponse.json(
      {
        ok: false,
        message: "A nova senha precisa ser diferente da senha atual.",
      },
      { status: 400 },
    )
  }

  const now = new Date()

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash: hashPassword(newPassword),
        passwordUpdatedAt: now,
      })
      .where(eq(users.id, authenticatedUser.userId))

    await tx
      .update(authSessions)
      .set({
        status: "revoked",
        revokedAt: now,
      })
      .where(
        and(
          eq(authSessions.userId, authenticatedUser.userId),
          ne(authSessions.id, authenticatedUser.sessionId),
          eq(authSessions.status, "active"),
        ),
      )
  })

  return NextResponse.json(
    {
      ok: true,
      message: "Senha atualizada com sucesso.",
    },
    { status: 200 },
  )
}
