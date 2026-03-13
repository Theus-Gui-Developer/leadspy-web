import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { moveSavedAd } from "@/lib/saved-ads/service"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function PATCH(
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

  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    return NextResponse.json(
      { ok: false, message: "Payload JSON invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, message: "Payload invalido." },
      { status: 400, headers: corsHeaders },
    )
  }

  const { folderId } = payload as Record<string, unknown>
  const { id } = await params

  const result = await moveSavedAd(
    authenticatedUser.userId,
    id,
    typeof folderId === "string" ? folderId : null,
  )

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 404, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true, savedAd: result.savedAd },
    { status: 200, headers: corsHeaders },
  )
}
