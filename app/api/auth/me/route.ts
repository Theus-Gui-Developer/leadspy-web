import { NextResponse } from "next/server"

import {
  buildAuthUserPayload,
  getAuthenticatedUserFromRequest,
} from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function GET(request: Request) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      {
        ok: false,
        message: "Nao autenticado.",
      },
      { status: 401, headers: corsHeaders },
    )
  }

  const user = await buildAuthUserPayload(authenticatedUser.userId)

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Usuario nao encontrado.",
      },
      { status: 404, headers: corsHeaders },
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
    { status: 200, headers: corsHeaders },
  )
}
