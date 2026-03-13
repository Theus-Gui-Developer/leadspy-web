import { NextResponse } from "next/server"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { buildCorsHeaders, buildOptionsCorsResponse } from "@/lib/http/cors"
import { createFolder, listFolders } from "@/lib/saved-ads/folders"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return buildOptionsCorsResponse(request)
}

export async function GET(request: Request) {
  const corsHeaders = buildCorsHeaders(request)
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      { ok: false, message: "Nao autenticado." },
      { status: 401, headers: corsHeaders },
    )
  }

  const result = await listFolders(authenticatedUser.userId)

  return NextResponse.json(
    { ok: true, ...result },
    { status: 200, headers: corsHeaders },
  )
}

export async function POST(request: Request) {
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

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { ok: false, message: "Nome da pasta e obrigatorio." },
      { status: 400, headers: corsHeaders },
    )
  }

  const result = await createFolder(authenticatedUser.userId, name)

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 409, headers: corsHeaders },
    )
  }

  return NextResponse.json(
    { ok: true, folder: result.folder },
    { status: 201, headers: corsHeaders },
  )
}
