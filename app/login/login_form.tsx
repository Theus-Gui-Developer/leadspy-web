"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  LockPasswordIcon,
  EyeIcon,
  ViewOffIcon,
  Loading03Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState<LoginState>({ status: "idle" })

  const isLoading = loginState.status === "loading"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginState({ status: "loading" })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, client: "web" }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
        redirectTo?: string
      }

      if (!response.ok || !result.ok) {
        setLoginState({
          status: "error",
          message:
            result.message ??
            "Email ou senha incorretos. Verifique seus dados e tente novamente.",
        })
        return
      }

      // router.replace para não acumular /login no histórico
      // router.refresh() força o Server Component do layout a re-executar com os cookies de sessão
      router.replace(result.redirectTo ?? "/dashboard")
      router.refresh()
    } catch {
      setLoginState({
        status: "error",
        message:
          "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      })
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Campo Email */}
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            required
            disabled={isLoading}
            className="h-11 rounded-xl pl-9 text-sm"
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <HugeiconsIcon icon={LockPasswordIcon} size={16} />
          </span>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isLoading}
            className="h-11 rounded-xl pl-9 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
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
      </div>

      {/* Mensagem de erro */}
      {loginState.status === "error" && (
        <div className="animate-slide-up flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <HugeiconsIcon icon={AlertCircleIcon} size={16} className="mt-0.5 shrink-0" />
          <span>{loginState.message}</span>
        </div>
      )}

      {/* Botão de submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-xl text-sm font-semibold"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            Entrando...
          </span>
        ) : (
          "Entrar"
        )}
      </Button>

      {/* Suporte */}
      <p className="text-center text-xs text-muted-foreground">
        Não tem acesso?{" "}
        <span className="text-foreground/60">
          Entre em contato com o suporte.
        </span>
      </p>
    </form>
  )
}
