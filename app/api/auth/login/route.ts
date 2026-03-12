import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import {
  buildAuthUserPayload,
  getRequestContext,
  getLatestActiveSubscription,
  issueAuthSession,
  setWebSessionCookies,
  touchUserLogin,
} from "@/lib/auth/session"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { verifyPassword } from "@/lib/security/password"

type LoginClient = "web" | "extension"

export const runtime = "nodejs"

export async function POST(request: Request) {
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

  const { email, password, client, installationId } = payload as Record<string, unknown>

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      {
        ok: false,
        message: "Email e senha sao obrigatorios.",
      },
      { status: 400 },
    )
  }

  const normalizedClient: LoginClient = client === "extension" ? "extension" : "web"

  if (
    normalizedClient === "extension" &&
    (typeof installationId !== "string" || installationId.trim().length === 0)
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "installationId e obrigatorio para login da extensao.",
      },
      { status: 400 },
    )
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1)

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Credenciais invalidas.",
      },
      { status: 401 },
    )
  }

  const activeSubscription = await getLatestActiveSubscription(user.id)

  if (!activeSubscription) {
    return NextResponse.json(
      {
        ok: false,
        message: "Nenhuma assinatura ativa foi encontrada para esta conta.",
      },
      { status: 403 },
    )
  }

  const requestContext = getRequestContext(request)

  const session = await issueAuthSession({
    userId: user.id,
    client: normalizedClient,
    installationId:
      normalizedClient === "extension" && typeof installationId === "string"
        ? installationId.trim()
        : null,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  })

  await touchUserLogin(user.id)

  const authUser = await buildAuthUserPayload(user.id)

  if (!authUser) {
    return NextResponse.json(
      {
        ok: false,
        message: "Usuario nao encontrado apos autenticacao.",
      },
      { status: 500 },
    )
  }

  if (normalizedClient === "web") {
    await setWebSessionCookies({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt,
    })
  }

  return NextResponse.json(
    {
      ok: true,
      client: normalizedClient,
      session:
        normalizedClient === "extension"
          ? {
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              accessTokenExpiresAt: session.accessTokenExpiresAt,
              refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            }
          : {
              accessTokenExpiresAt: session.accessTokenExpiresAt,
              refreshTokenExpiresAt: session.refreshTokenExpiresAt,
            },
      user: authUser,
    },
    { status: 200 },
  )
}
