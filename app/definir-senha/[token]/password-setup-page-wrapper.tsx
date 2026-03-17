"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Clock01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"

import { AuthLayout } from "@/components/auth/auth_layout"
import { AuthCard } from "@/components/auth/auth_card"
import { ThemeToggle } from "@/components/ui/theme_toggle"
import { PasswordSetupForm } from "./password-setup-form"

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type TokenStatus = "valid" | "expired" | "used" | "invalid"

type TokenState =
  | { status: "valid"; email: string; name?: string | null }
  | { status: "expired" }
  | { status: "used" }
  | { status: "invalid" }

type PageWrapperProps = {
  token: string
  tokenState: TokenState
}

// ─── Estado: Token expirado ───────────────────────────────────────────────────

function TokenExpiredState() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.76 0.17 65 / 20%)" }}
        />
        <div
          className="relative flex size-14 items-center justify-center rounded-2xl border"
          style={{
            background: "oklch(0.76 0.17 65 / 12%)",
            borderColor: "oklch(0.76 0.17 65 / 25%)",
            boxShadow: "0 0 0 1px oklch(0.76 0.17 65 / 8%)",
          }}
        >
          <HugeiconsIcon
            icon={Clock01Icon}
            size={28}
            style={{ color: "oklch(0.76 0.17 65)" }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2
          className="text-lg font-semibold"
          style={{ color: "oklch(0.76 0.17 65)" }}
        >
          Link expirado
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Este link de acesso expirou. Solicite um novo convite ao suporte ou
          aguarde um novo envio automático.
        </p>
      </div>

      <a
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
        Voltar ao login
      </a>
    </div>
  )
}

// ─── Estado: Token já utilizado ───────────────────────────────────────────────

function TokenUsedState() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.60 0.19 264 / 20%)" }}
        />
        <div
          className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12"
          style={{
            boxShadow: "0 0 0 1px oklch(0.60 0.20 264 / 8%)",
          }}
        >
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            size={28}
            className="text-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Senha já configurada
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Este link já foi utilizado anteriormente. Se precisar redefinir seu
          acesso, entre em contato com o suporte.
        </p>
      </div>

      <a
        href="/login"
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary/15 px-5 text-sm font-medium text-primary transition-colors hover:bg-primary/25"
      >
        Ir para o login
      </a>
    </div>
  )
}

// ─── Estado: Token inválido ───────────────────────────────────────────────────

function TokenInvalidState() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-20 rounded-full blur-2xl"
          style={{ background: "oklch(0.63 0.22 27 / 20%)" }}
        />
        <div
          className="relative flex size-14 items-center justify-center rounded-2xl border"
          style={{
            background: "oklch(0.63 0.22 27 / 12%)",
            borderColor: "oklch(0.63 0.22 27 / 25%)",
            boxShadow: "0 0 0 1px oklch(0.63 0.22 27 / 8%)",
          }}
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={28}
            style={{ color: "oklch(0.63 0.22 27)" }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2
          className="text-lg font-semibold"
          style={{ color: "oklch(0.63 0.22 27)" }}
        >
          Link inválido
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Este link é inválido ou não existe mais. Verifique se copiou
          corretamente ou solicite um novo acesso.
        </p>
      </div>

      <a
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
        Voltar ao login
      </a>
    </div>
  )
}

// ─── Estado: Sucesso após salvar ──────────────────────────────────────────────

function SuccessState({ secondsLeft }: { secondsLeft: number }) {
  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center animate-scale-in">
      {/* Ícone de sucesso com glow verde */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute size-24 rounded-full blur-2xl"
          style={{ background: "oklch(0.72 0.19 142 / 25%)" }}
        />
        {/* Círculo externo pulsante */}
        <div
          aria-hidden
          className="absolute size-20 animate-ping rounded-full border-2 opacity-20"
          style={{ borderColor: "oklch(0.72 0.19 142)" }}
        />
        <div
          className="relative flex size-16 items-center justify-center rounded-full border-2"
          style={{
            background: "oklch(0.72 0.19 142 / 15%)",
            borderColor: "oklch(0.72 0.19 142 / 40%)",
            boxShadow:
              "0 0 32px oklch(0.72 0.19 142 / 20%), 0 0 0 1px oklch(0.72 0.19 142 / 8%)",
          }}
        >
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            size={36}
            style={{ color: "oklch(0.72 0.19 142)" }}
          />
        </div>
      </div>

      {/* Mensagens */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Senha definida com sucesso!
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Sua conta LeadSpy está pronta. Acesse o dashboard usando seu email e a
          senha que você acabou de criar.
        </p>
      </div>

      {/* CTA */}
      <a
        href="/login"
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        style={{
          boxShadow: "0 4px 20px oklch(0.60 0.20 264 / 25%)",
        }}
      >
        Acessar o LeadSpy
      </a>

      {/* Contador de redirecionamento automático */}
      <p className="text-xs text-muted-foreground">
        Redirecionando em {secondsLeft}s...
      </p>
    </div>
  )
}

// ─── Conteúdo por status de token ────────────────────────────────────────────

const invalidTokenContent: Record<
  Exclude<TokenStatus, "valid">,
  React.ReactElement
> = {
  expired: <TokenExpiredState />,
  used: <TokenUsedState />,
  invalid: <TokenInvalidState />,
}

// ─── Wrapper principal ────────────────────────────────────────────────────────

export function PasswordSetupPageWrapper({ token, tokenState }: PageWrapperProps) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(5)

  useEffect(() => {
    if (!success) return

    if (secondsLeft <= 0) {
      router.replace("/login")
      return
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [success, secondsLeft, router])

  const status = tokenState.status

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 animate-slide-up">
        {/* Branding */}
        <Image
          src="/logo_extended.png"
          alt="LeadSpy"
          width={140}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />

        {/* Card */}
        {success ? (
          <AuthCard action={<ThemeToggle />} className="w-full">
            <SuccessState secondsLeft={secondsLeft} />
          </AuthCard>
        ) : status === "valid" ? (
          <AuthCard
            badge="LeadSpy Access"
            title="Defina sua senha"
            subtitle="Finalize a criação da sua conta para acessar o dashboard e concluir a ativação."
            action={<ThemeToggle />}
            className="w-full"
          >
            <PasswordSetupForm
              token={token}
              email={(tokenState as Extract<TokenState, { status: "valid" }>).email}
              defaultName={
                (tokenState as Extract<TokenState, { status: "valid" }>).name ?? ""
              }
              onSuccess={() => setSuccess(true)}
            />
          </AuthCard>
        ) : (
          <AuthCard action={<ThemeToggle />} className="w-full">
            {invalidTokenContent[status as Exclude<TokenStatus, "valid">]}
          </AuthCard>
        )}
      </div>
    </AuthLayout>
  )
}
