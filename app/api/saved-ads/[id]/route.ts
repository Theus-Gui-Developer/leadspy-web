import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { deleteSavedAd } from "@/lib/saved-ads/service"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function DELETE(
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

  const deleted = await deleteSavedAd(authenticatedUser.userId, id)

  if (!deleted) {
    return NextResponse.json(
      { ok: false, message: "Anuncio salvo nao encontrado." },
      { status: 404, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: corsHeaders },
  )
}
