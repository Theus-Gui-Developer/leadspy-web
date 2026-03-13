"use client"

import { type FormEvent, useState } from "react"

import Link from "next/link"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Loading03Icon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("")
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle" })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestState({ status: "loading" })

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        setRequestState({
          status: "error",
          message: result.message ?? "Nao foi possivel enviar o link agora.",
        })
        return
      }

      setRequestState({
        status: "success",
        message: result.message ?? "Se existir uma conta, enviaremos o link por email.",
      })
    } catch {
      setRequestState({
        status: "error",
        message: "Erro inesperado. Tente novamente em instantes.",
      })
    }
  }

  if (requestState.status === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-ls-success/30 bg-ls-success/10 text-ls-success">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Confira seu email</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {requestState.message}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          Voltar ao login
        </Link>
      </div>
    )
  }

  const isLoading = requestState.status === "loading"

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <HugeiconsIcon icon={Mail01Icon} size={16} />
          </span>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={isLoading}
            className="h-11 rounded-xl pl-9 text-sm"
          />
        </div>
      </div>

      {requestState.status === "error" && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {requestState.message}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="h-11 w-full rounded-xl text-sm font-semibold" size="lg">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            Enviando...
          </span>
        ) : (
          "Enviar link de recuperacao"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Lembrou a senha? <Link href="/login" className="text-primary hover:underline">Voltar para entrar</Link>
      </p>
    </form>
  )
}
