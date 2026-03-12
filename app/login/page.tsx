import { AuthLayout } from "@/components/auth/auth_layout"
import { AuthCard } from "@/components/auth/auth_card"
import { LoginForm } from "./login_form"

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 animate-slide-up">
        {/* Logo e branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Nome do produto */}
          <div>
            <h2
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Lead<span className="text-primary">Spy</span>
            </h2>
          </div>
        </div>

        {/* Card do formulário */}
        <AuthCard
          badge="LeadSpy Access"
          title="Bem-vindo de volta"
          subtitle="Entre com suas credenciais para acessar o dashboard."
          className="w-full"
        >
          <LoginForm />
        </AuthCard>
      </div>
    </AuthLayout>
  )
}
