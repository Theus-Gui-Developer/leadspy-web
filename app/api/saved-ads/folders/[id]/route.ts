import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { deleteFolder, updateFolder } from "@/lib/saved-ads/folders"

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

  const { name } = payload as Record<string, unknown>
  const { id } = await params

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Nome da pasta e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }

  const result = await updateFolder(authenticatedUser.userId, id, name)

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: result.message === "Pasta nao encontrada." ? 404 : 409, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true, folder: result.folder },
    { status: 200, headers: corsHeaders },
  )
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

  const deleted = await deleteFolder(authenticatedUser.userId, id)

  if (!deleted) {
    return NextResponse.json(
      { ok: false, message: "Pasta nao encontrada." },
      { status: 404, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: corsHeaders },
  )
}
