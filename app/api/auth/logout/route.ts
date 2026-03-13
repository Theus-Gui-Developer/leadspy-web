import { NextResponse } from "next/server"

import {
  clearWebSessionCookies,
  getRawAccessTokenFromRequest,
  getRawRefreshTokenFromRequest,
  revokeAuthSessionByAccessToken,
  revokeAuthSessionByRefreshToken,
} from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(request: Request) {
  const corsHeaders = buildCorsHeaders(request)
  const rawAccessToken = await getRawAccessTokenFromRequest(request)
  const rawRefreshToken = await getRawRefreshTokenFromRequest(request)

  if (rawAccessToken) {
    await revokeAuthSessionByAccessToken(rawAccessToken)
  } else if (rawRefreshToken) {
    await revokeAuthSessionByRefreshToken(rawRefreshToken)
  }

  await clearWebSessionCookies()

  return NextResponse.json(
    {
      ok: true,
    },
    { status: 200, headers: corsHeaders },
  )
}
