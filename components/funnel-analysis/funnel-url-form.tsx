"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FunnelUrlFormProps = {
  onSubmit: (url: string) => void
  isLoading?: boolean
}

export function FunnelUrlForm({ onSubmit, isLoading = false }: FunnelUrlFormProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  function validate(value: string): boolean {
    try {
      const parsed = new URL(value)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()

    if (!trimmed) {
      setError("Informe uma URL para analisar.")
      return
    }

    if (!validate(trimmed)) {
      setError("URL inválida. Use o formato https://exemplo.com")
      return
    }

    setError(null)
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <HugeiconsIcon
              icon={LinkSquare02Icon}
              size={16}
              className="text-muted-foreground"
            />
          </div>
          <Input
            type="url"
            placeholder="https://exemplo.com/pagina-de-vendas"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) setError(null)
            }}
            disabled={isLoading}
            className="pl-9"
            aria-label="URL do funil de vendas"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="gap-2 shrink-0">
          <HugeiconsIcon icon={Search01Icon} size={16} />
          {isLoading ? "Analisando..." : "Analisar"}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </form>
  )
}
