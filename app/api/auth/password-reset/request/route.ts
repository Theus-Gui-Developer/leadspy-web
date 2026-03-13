import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import { issuePasswordSetupToken, sendPasswordSetupEmail } from "@/lib/auth/password-setup"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export const runtime = "nodejs"

const GENERIC_SUCCESS_MESSAGE =
  "Se encontrarmos uma conta com este email, enviaremos um link para redefinir sua senha."

export async function POST(request: Request) {
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

  const { email } = payload as Record<string, unknown>

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email invalido.",
      },
      { status: 400 },
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (user) {
    try {
      const tokenResult = await issuePasswordSetupToken({
        email: user.email,
        name: user.name,
        userId: user.id,
        source: "password_reset",
      })

      if (tokenResult.created) {
        await sendPasswordSetupEmail({
          email: tokenResult.email,
          name: tokenResult.name,
          rawToken: tokenResult.rawToken,
          mode: "reset",
        })
      }
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Nao foi possivel processar a solicitacao agora. Tente novamente.",
        },
        { status: 500 },
      )
    }
  }

  return NextResponse.json(
    {
      ok: true,
      message: GENERIC_SUCCESS_MESSAGE,
    },
    { status: 200 },
  )
}
