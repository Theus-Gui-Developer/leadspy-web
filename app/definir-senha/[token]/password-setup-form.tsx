"use client"

import { type FormEvent, useState } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockPasswordIcon,
  EyeIcon,
  ViewOffIcon,
  Loading03Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  UserIcon,
  Mail01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PasswordSetupFormProps = {
  token: string
  email: string
  defaultName: string
  onSuccess: () => void
}

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }

// ─── Indicador de força de senha ─────────────────────────────────────────────

type PasswordStrengthLevel = "fraco" | "medio" | "forte"

type PasswordStrength = {
  level: PasswordStrengthLevel
  score: 1 | 2 | 3
}

function getPasswordStrength(password: string): PasswordStrength | null {
  if (password.length === 0) return null
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  if (password.length >= 8 && hasNumber && hasSpecial) {
    return { level: "forte", score: 3 }
  }
  if (password.length >= 8 && hasNumber) {
    return { level: "medio", score: 2 }
  }
  return { level: "fraco", score: 1 }
}

const strengthConfig: Record<
  PasswordStrengthLevel,
  { label: string; barClass: string; width: string; textClass: string }
> = {
  fraco: {
    label: "Fraca",
    barClass: "bg-destructive",
    width: "w-1/3",
    textClass: "text-destructive",
  },
  medio: {
    label: "Média",
    barClass: "bg-[oklch(0.76_0.17_65)]",
    width: "w-2/3",
    textClass: "text-[oklch(0.76_0.17_65)]",
  },
  forte: {
    label: "Forte",
    barClass: "bg-ls-success",
    width: "w-full",
    textClass: "text-ls-success",
  },
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  if (!strength) return null

  const config = strengthConfig[strength.level]

  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${config.barClass} ${config.width}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Força da senha:{" "}
        <span className={config.textClass}>{config.label}</span>
      </p>
    </div>
  )
}

// ─── Formulário principal ─────────────────────────────────────────────────────

export function PasswordSetupForm({
  token,
  email,
  defaultName,
  onSuccess,
}: PasswordSetupFormProps) {
  const [name, setName] = useState(defaultName)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" })

  const isLoading = submitState.status === "loading"
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setSubmitState({
        status: "error",
        message: "As senhas não conferem. Verifique e tente novamente.",
      })
      return
    }

    setSubmitState({ status: "loading" })

    try {
      const response = await fetch("/api/auth/password-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        setSubmitState({
          status: "error",
          message:
            result.message ??
            "Não foi possível definir sua senha. Tente novamente.",
        })
        return
      }

      onSuccess()
    } catch {
      setSubmitState({
        status: "error",
        message: "Erro inesperado. Verifique sua conexão e tente novamente.",
      })
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Email (readonly) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground/50">
            <HugeiconsIcon icon={Mail01Icon} size={16} />
          </span>
          <Input
            id="email"
            value={email}
            disabled
            className="h-11 cursor-not-allowed rounded-xl pl-9 text-sm opacity-60"
          />
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <HugeiconsIcon icon={UserIcon} size={16} />
          </span>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            disabled={isLoading}
            className="h-11 rounded-xl pl-9 text-sm"
          />
        </div>
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <HugeiconsIcon icon={LockPasswordIcon} size={16} />
          </span>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo de 8 caracteres"
            required
            disabled={isLoading}
            className="h-11 rounded-xl pl-9 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            disabled={isLoading}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
          >
            <HugeiconsIcon
              icon={showPassword ? ViewOffIcon : EyeIcon}
              size={16}
            />
          </button>
        </div>
        <PasswordStrengthIndicator password={password} />
      </div>

      {/* Confirmar senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <HugeiconsIcon icon={Shield01Icon} size={16} />
          </span>
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita sua senha"
            required
            disabled={isLoading}
            className={`h-11 rounded-xl pl-9 pr-16 text-sm transition-all ${
              confirmPassword.length > 0
                ? passwordsMatch
                  ? "border-ls-success/40 focus-visible:border-ls-success/60 focus-visible:ring-ls-success/20"
                  : "border-destructive/40 focus-visible:border-destructive/60 focus-visible:ring-destructive/20"
                : ""
            }`}
          />
          <span className="absolute inset-y-0 right-3 flex items-center gap-1.5">
            {confirmPassword.length > 0 && passwordsMatch && (
              <span className="text-ls-success">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              disabled={isLoading}
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
              className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
            >
              <HugeiconsIcon
                icon={showConfirm ? ViewOffIcon : EyeIcon}
                size={16}
              />
            </button>
          </span>
        </div>
      </div>

      {/* Erro */}
      {submitState.status === "error" && (
        <div className="animate-slide-up flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span>{submitState.message}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-xl text-sm font-semibold"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            Salvando...
          </span>
        ) : (
          "Definir senha e acessar"
        )}
      </Button>
    </form>
  )
}
