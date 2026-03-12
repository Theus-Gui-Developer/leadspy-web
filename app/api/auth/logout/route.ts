import { NextResponse } from "next/server"

import {
  clearWebSessionCookies,
  getRawAccessTokenFromRequest,
  getRawRefreshTokenFromRequest,
  revokeAuthSessionByAccessToken,
  revokeAuthSessionByRefreshToken,
} from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST(request: Request) {
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
    { status: 200 },
  )
}
