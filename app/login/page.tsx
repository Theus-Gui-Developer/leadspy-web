import { AuthLayout } from "@/components/auth/auth_layout"
import { AuthCard } from "@/components/auth/auth_card"
import { LoginForm } from "./login_form"

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 animate-slide-up">
        {/* Logo e branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Logotipo */}
          <div className="relative flex items-center justify-center">
            {/* Glow atrás do logo */}
            <div
              aria-hidden
              className="absolute size-16 rounded-full blur-2xl"
              style={{
                background: "oklch(0.60 0.20 264 / 30%)",
              }}
            />
            <div
              className="relative flex size-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15"
              style={{
                boxShadow: "0 0 0 1px oklch(0.60 0.20 264 / 10%), 0 4px 20px oklch(0.60 0.20 264 / 20%)",
              }}
            >
              {/* Ícone de "spy" — olho com scan */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z"
                  stroke="oklch(0.60 0.20 264)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="oklch(0.60 0.20 264)"
                  fillOpacity="0.9"
                />
                <circle cx="12" cy="12" r="1.2" fill="white" />
                {/* Linha de scan */}
                <line
                  x1="3"
                  y1="12"
                  x2="6"
                  y2="12"
                  stroke="oklch(0.60 0.20 264)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="18"
                  y1="12"
                  x2="21"
                  y2="12"
                  stroke="oklch(0.60 0.20 264)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Nome do produto */}
          <div>
            <h2
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Lead<span className="text-primary">Spy</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Inteligência para anúncios vencedores
            </p>
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
