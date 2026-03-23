import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { generateShareToken } from "@/lib/saved-ads/service"
import { env } from "@/lib/env"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }

  const { id } = await params

  const result = await generateShareToken(authenticatedUser.userId, id)

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 404, headers: corsHeaders },
    )
  }

  const baseUrl = env.APP_URL || "https://app.adsniper.com.br"
  const shareUrl = `${baseUrl}/anuncio/${result.shareToken}`

  return NextResponse.json(
    { ok: true, shareUrl, shareToken: result.shareToken },
    { status: 200, headers: corsHeaders },
  )
}
