import "server-only"

import { Resend } from "resend"

import { env } from "@/lib/env"

let resendClient: Resend | null = null

export function getResendClient() {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY nao configurada.")
  }

  resendClient ??= new Resend(env.RESEND_API_KEY)

  return resendClient
}

export function getResendFromEmail() {
  if (!env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL nao configurado.")
  }

  return env.RESEND_FROM_EMAIL
}
