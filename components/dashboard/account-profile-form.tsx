"use client"

import { type FormEvent, useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AccountProfileFormProps = {
  initialName: string
  email: string
}

export function AccountProfileForm({ initialName, email }: AccountProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)

  const hasChanges = name.trim() !== initialName.trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasChanges) {
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        toast.error(result.message ?? "Nao foi possivel atualizar seu nome.")
        return
      }

      toast.success("Nome atualizado com sucesso.")
      window.location.reload()
    } catch {
      toast.error("Erro inesperado ao atualizar seu nome.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account-name">Nome completo</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSaving}
            maxLength={120}
            className="h-11 rounded-xl text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-email">Email</Label>
          <Input
            id="account-email"
            value={email}
            disabled
            className="h-11 rounded-xl text-sm opacity-70"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          O email continua como identificador principal da sua conta.
        </p>
        <Button
          type="submit"
          disabled={!hasChanges || isSaving}
          className="h-11 rounded-xl px-5 text-sm font-semibold"
        >
          {isSaving ? "Salvando..." : "Salvar nome"}
        </Button>
      </div>
    </form>
  )
}
