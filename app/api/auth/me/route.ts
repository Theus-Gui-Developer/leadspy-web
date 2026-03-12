import { NextResponse } from "next/server"

import {
  buildAuthUserPayload,
  getAuthenticatedUserFromRequest,
} from "@/lib/auth/session"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      {
        ok: false,
        message: "Nao autenticado.",
      },
      { status: 401 },
    )
  }

  const user = await buildAuthUserPayload(authenticatedUser.userId)

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Usuario nao encontrado.",
      },
      { status: 404 },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      client: authenticatedUser.sessionClient,
      session: {
        id: authenticatedUser.sessionId,
        accessTokenExpiresAt: authenticatedUser.accessTokenExpiresAt,
        refreshTokenExpiresAt: authenticatedUser.refreshTokenExpiresAt,
      },
      user,
    },
    { status: 200 },
  )
}
