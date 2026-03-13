import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { saveSharedAdToAccount } from "@/lib/saved-ads/service"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }

  const { shareToken } = await params

  if (!shareToken || shareToken.length !== 32) {
    return NextResponse.json(
      { ok: false, message: "Link invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  const result = await saveSharedAdToAccount(shareToken, authenticatedUser.userId)

  if (!result.ok) {
    if ("duplicate" in result && result.duplicate) {
      return NextResponse.json(
        { ok: false, message: "Voce ja salvou este anuncio.", duplicate: true },
        { status: 409, headers: corsHeaders },
      )
    }

    return NextResponse.json(
      { ok: false, message: "message" in result ? result.message : "Erro ao salvar anuncio." },
      { status: 404, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true, savedAd: result.savedAd },
    { status: 201, headers: corsHeaders },
  )
}
