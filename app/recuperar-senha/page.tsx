import Image from "next/image"

import { AuthLayout } from "@/components/auth/auth_layout"

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

        <div
          className="relative w-full rounded-2xl border border-white/[0.08] bg-[oklch(0.11_0.025_255/85%)] p-8 backdrop-blur-xl"
          style={{
            boxShadow:
              "0 32px 80px oklch(0 0 0 / 50%), 0 8px 32px oklch(0 0 0 / 30%), inset 0 1px 0 oklch(1 0 0 / 8%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.60 0.20 264 / 50%), transparent)",
            }}
          />

          <div className="mb-8 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              LeadSpy Access
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Recuperar senha
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Informe o email principal da sua conta para receber um link seguro de
              redefinicao.
            </p>
          </div>

          <PasswordResetRequestForm />
        </div>
      </div>
    </AuthLayout>
  )
}
