import { NextResponse } from "next/server"

import { consumePasswordSetupToken } from "@/lib/auth/password-setup"

export const runtime = "nodejs"

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

  const { token, name, password } = payload as Record<string, unknown>

  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Token invalido.",
      },
      { status: 400 },
    )
  }

  if (typeof password !== "string") {
    return NextResponse.json(
      {
        ok: false,
        message: "Senha invalida.",
      },
      { status: 400 },
    )
  }

  const result = await consumePasswordSetupToken({
    rawToken: token,
    name: typeof name === "string" ? name : undefined,
    password,
  })

  return NextResponse.json(result, { status: result.status })
}
