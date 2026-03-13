import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { reorderFolders } from "@/lib/saved-ads/folders"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function PATCH(request: Request) {
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

  const { folderIds } = payload as Record<string, unknown>

  if (!Array.isArray(folderIds) || folderIds.some((id) => typeof id !== "string")) {
    return NextResponse.json(
      { ok: false, message: "folderIds deve ser um array de UUIDs." },
      { status: 400, headers: corsHeaders },
    )
  }

  await reorderFolders(authenticatedUser.userId, folderIds)

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: corsHeaders },
  )
}
