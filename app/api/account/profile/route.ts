import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const authenticatedUser = await getAuthenticatedUserFromRequest(request)

  if (!authenticatedUser) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sessao invalida ou expirada.",
      },
      { status: 401 },
    )
  }

  let payload: unknown

  try {
    payload = JSON.parse(await request.text())
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload JSON invalido.",
      },
      { status: 400 },
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      {
        ok: false,
        message: "Payload invalido.",
      },
      { status: 400 },
    )
  }

  const { name } = payload as Record<string, unknown>

  if (typeof name !== "string") {
    return NextResponse.json(
      {
        ok: false,
        message: "Nome invalido.",
      },
      { status: 400 },
    )
  }

  const normalizedName = name.trim()

  if (normalizedName.length < 2) {
    return NextResponse.json(
      {
        ok: false,
        message: "Informe um nome com pelo menos 2 caracteres.",
      },
      { status: 400 },
    )
  }

  if (normalizedName.length > 120) {
    return NextResponse.json(
      {
        ok: false,
        message: "O nome nao pode ter mais de 120 caracteres.",
      },
      { status: 400 },
    )
  }

  const [updatedUser] = await db
    .update(users)
    .set({ name: normalizedName })
    .where(eq(users.id, authenticatedUser.userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    })

  return NextResponse.json(
    {
      ok: true,
      user: updatedUser,
    },
    { status: 200 },
  )
}
