import "server-only"

import { cookies, headers } from "next/headers"

/**
 * Tipos que refletem a resposta de GET /api/auth/me.
 * Datas chegam como strings ISO — use `new Date(...)` ao consumir.
 */
export type MeSubscription = {
  id: string
  status: "active" | "expired" | "cancelled" | "pending" | "refunded" | "chargeback"
  expiresAt: string | null // ISO string
  planId: string
}

export type MeUser = {
  id: string
  email: string
  name: string
  role: "admin" | "customer"
  subscription: MeSubscription | null
}

export type MeSession = {
  id: string
  accessTokenExpiresAt: string // ISO string
  refreshTokenExpiresAt: string // ISO string
}

export type MeResponse =
  | { ok: true; client: string; session: MeSession; user: MeUser }
  | { ok: false; message: string }

/**
 * Chama GET /api/auth/me a partir de um Server Component,
 * encaminhando os cookies httpOnly da requisição atual.
 */
export async function getMe(): Promise<MeResponse> {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const host = headerStore.get("host") ?? "localhost:3000"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Cookie: cookieStore.toString(),
    },
    // Nunca cachear — dados de sessão devem ser sempre frescos
    cache: "no-store",
  })

  const data = (await response.json()) as MeResponse
  return data
}
