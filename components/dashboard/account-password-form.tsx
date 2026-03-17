"use client"

import { type FormEvent, useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AccountPasswordFormProps = {
  email: string
}

export function AccountPasswordForm({ email }: AccountPasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("As novas senhas nao conferem.")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const result = (await response.json()) as {
        ok: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        toast.error(result.message ?? "Nao foi possivel atualizar sua senha.")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success(result.message ?? "Senha atualizada com sucesso.")
    } catch {
      toast.error("Erro inesperado ao atualizar sua senha.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleForgotPassword() {
    setIsSendingReset(true)

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
        toast.error(result.message ?? "Nao foi possivel enviar o email de recuperacao.")
        return
      }

      toast.success("Enviamos um email de recuperacao para sua conta.")
    } catch {
      toast.error("Erro inesperado ao enviar o email de recuperacao.")
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="current-password">Senha atual</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={isSaving}
            autoComplete="current-password"
            required
            className="h-11 rounded-xl text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={isSaving}
            autoComplete="new-password"
            required
            className="h-11 rounded-xl text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
          <Input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSaving}
            autoComplete="new-password"
            required
            className="h-11 rounded-xl text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Ao trocar a senha, outras sessoes ativas serao encerradas por seguranca.
          </p>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isSendingReset || isSaving}
            className="text-xs font-medium text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingReset ? "Enviando email de recuperacao..." : "Esqueceu a senha? Enviar email de recuperacao"}
          </button>
        </div>
        <Button
          type="submit"
          disabled={isSaving || isSendingReset}
          className="h-11 rounded-xl px-5 text-sm font-semibold"
        >
          {isSaving ? "Atualizando..." : "Alterar senha"}
        </Button>
      </div>
    </form>
  )
}
