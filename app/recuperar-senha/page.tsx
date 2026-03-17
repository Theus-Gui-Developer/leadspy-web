import Image from "next/image"

import { AuthLayout } from "@/components/auth/auth_layout"
import { AuthCard } from "@/components/auth/auth_card"
import { ThemeToggle } from "@/components/ui/theme_toggle"

import { PasswordResetRequestForm } from "./password-reset-request-form"

export default function RecuperarSenhaPage() {
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 animate-slide-up">
        <Image
          src="/logo_extended.png"
          alt="LeadSpy"
          width={140}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />

        <AuthCard
          badge="LeadSpy Access"
          title="Recuperar senha"
          subtitle="Informe o email principal da sua conta para receber um link seguro de redefinição."
          action={<ThemeToggle />}
          className="w-full"
        >
          <PasswordResetRequestForm />
        </AuthCard>
      </div>
    </AuthLayout>
  )
}
