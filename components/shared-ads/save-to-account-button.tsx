"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DownloadCircle02Icon,
  Tick02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type SaveToAccountButtonProps = {
  shareToken: string
}

type SaveState = "idle" | "saving" | "saved" | "duplicate" | "unauthenticated" | "error"

export function SaveToAccountButton({ shareToken }: SaveToAccountButtonProps) {
  const router = useRouter()
  const [state, setState] = useState<SaveState>("idle")

  async function handleSave() {
    if (state === "saving" || state === "saved") return

    setState("saving")

    try {
      const res = await fetch(`/api/shared-ads/${shareToken}/save`, {
        method: "POST",
      })

      const data = (await res.json()) as {
        ok: boolean
        message?: string
        duplicate?: boolean
      }

      if (res.status === 401) {
        setState("unauthenticated")
        toast.error("Faça login para salvar este anúncio na sua conta.")
        setTimeout(() => {
          router.push("/login")
        }, 1500)
        return
      }

      if (data.duplicate) {
        setState("duplicate")
        toast.info("Você já salvou este anúncio anteriormente.")
        return
      }

      if (!res.ok || !data.ok) {
        setState("error")
        toast.error(data.message ?? "Erro ao salvar anúncio.")
        return
      }

      setState("saved")
      toast.success("Anúncio salvo na sua conta!")
    } catch {
      setState("error")
      toast.error("Erro inesperado ao salvar anúncio.")
    }
  }

  function getButtonContent() {
    switch (state) {
      case "saving":
        return { label: "Salvando...", disabled: true }
      case "saved":
        return { label: "Salvo", disabled: true }
      case "duplicate":
        return { label: "Já salvo", disabled: true }
      case "unauthenticated":
        return { label: "Redirecionando...", disabled: true }
      case "error":
        return { label: "Tentar novamente", disabled: false }
      default:
        return { label: "Salvar na minha conta", disabled: false }
    }
  }

  function getIcon() {
    switch (state) {
      case "saved":
      case "duplicate":
        return Tick02Icon
      case "error":
        return Alert02Icon
      default:
        return DownloadCircle02Icon
    }
  }

  const { label, disabled } = getButtonContent()

  return (
    <Button
      size="sm"
      onClick={handleSave}
      disabled={disabled}
    >
      <HugeiconsIcon
        icon={getIcon()}
        size={14}
        className={state === "saved" ? "text-emerald-300" : ""}
      />
      {label}
    </Button>
  )
}
