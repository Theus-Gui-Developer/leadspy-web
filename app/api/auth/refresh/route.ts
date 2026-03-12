import { NextResponse } from "next/server"

import {
  buildAuthUserPayload,
  getLatestActiveSubscription,
  getRawRefreshTokenFromRequest,
  getRequestContext,
  refreshAuthSession,
  revokeAuthSessionByRefreshToken,
  setWebSessionCookies,
} from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let bodyClient: "web" | "extension" = "web"
  let bodyRefreshToken: string | null = null

  try {
    const text = await request.text()

    if (text.trim()) {
      const payload = JSON.parse(text) as Record<string, unknown>
      bodyClient = payload.client === "extension" ? "extension" : "web"
      bodyRefreshToken =
        typeof payload.refreshToken === "string" ? payload.refreshToken : null
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload JSON invalido.",
      },
      { status: 400 },
    )
  }

  const rawRefreshToken = bodyRefreshToken ?? (await getRawRefreshTokenFromRequest(request))

  if (!rawRefreshToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "Refresh token nao informado.",
      },
      { status: 401 },
    )
  }

  const requestContext = getRequestContext(request)
  const session = await refreshAuthSession({
    rawRefreshToken,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  })

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sessao invalida ou expirada.",
      },
      { status: 401 },
    )
  }

  const user = await buildAuthUserPayload(session.userId)

  const activeSubscription = await getLatestActiveSubscription(session.userId)

  if (!activeSubscription) {
    await revokeAuthSessionByRefreshToken(rawRefreshToken)

    return NextResponse.json(
      {
        ok: false,
        message: "Nenhuma assinatura ativa foi encontrada para esta conta.",
      },
      { status: 403 },
    )
  }

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Usuario nao encontrado.",
      },
      { status: 404 },
    )
  }

  if (session.client === "web" && bodyClient !== "extension") {
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
      client: session.client,
      session:
        session.client === "extension" || bodyClient === "extension"
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
      user,
    },
    { status: 200 },
  )
}
