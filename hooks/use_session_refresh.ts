"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const REFRESH_THRESHOLD_MS = 2 * 60 * 1000 // 2 minutos antes do vencimento
const CHECK_INTERVAL_MS = 60 * 1000 // verifica a cada 60 segundos

/**
 * Hook que monitora o vencimento do access token e o renova automaticamente.
 *
 * - Chama POST /api/auth/refresh quando o token está a menos de 2 min de expirar.
 * - Se o refresh falhar (sessão inválida ou sem assinatura), redireciona para /login.
 * - O backend já rotaciona os cookies httpOnly automaticamente na resposta do refresh.
 */
export function useSessionRefresh(accessTokenExpiresAt: string) {
  const router = useRouter()
  const expiresAtRef = useRef(accessTokenExpiresAt)

  useEffect(() => {
    expiresAtRef.current = accessTokenExpiresAt
  }, [accessTokenExpiresAt])

  useEffect(() => {
    async function tryRefresh() {
      const now = Date.now()
      const expiresAt = new Date(expiresAtRef.current).getTime()
      const timeUntilExpiry = expiresAt - now

      // Se já expirou ou está prestes a expirar, tenta renovar
      if (timeUntilExpiry > REFRESH_THRESHOLD_MS) {
        return
      }

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client: "web" }),
        })

        if (!response.ok) {
          // Sessão inválida, sem assinatura, ou token expirado — redireciona
          router.replace("/login")
          return
        }

        // Os novos cookies já foram setados pelo backend.
        // Forçamos um recarregamento dos Server Components para pegar
        // o novo accessTokenExpiresAt do layout.
        router.refresh()
      } catch {
        // Falha de rede — não redireciona imediatamente, tenta novamente na próxima verificação
      }
    }

    // Verifica imediatamente ao montar
    void tryRefresh()

    const interval = setInterval(() => {
      void tryRefresh()
    }, CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [router])
}
