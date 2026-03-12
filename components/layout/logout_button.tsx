"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, Loading03Icon } from "@hugeicons/core-free-icons"

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    if (isLoading) return
    setIsLoading(true)

    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Mesmo em caso de falha de rede, forçamos o redirecionamento.
      // O cookie de sessão provavelmente já é inválido ou expirará.
    } finally {
      // router.replace evita que o usuário volte para o dashboard com o botão "voltar"
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
      title="Sair da conta"
      aria-label="Sair da conta"
    >
      <HugeiconsIcon
        icon={isLoading ? Loading03Icon : Logout01Icon}
        size={16}
        strokeWidth={1.5}
        className={isLoading ? "animate-spin" : undefined}
      />
      <span className="sr-only">Sair da conta</span>
    </button>
  )
}
