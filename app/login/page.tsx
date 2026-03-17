import { redirect } from "next/navigation"
import Image from "next/image"
import { AuthLayout } from "@/components/auth/auth_layout"
import { AuthCard } from "@/components/auth/auth_card"
import { ThemeToggle } from "@/components/ui/theme_toggle"
import { getMe } from "@/lib/api/get_me"
import { LoginForm } from "./login_form"

export default async function LoginPage() {
  const result = await getMe()
  if (result.ok) redirect("/dashboard")
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 animate-slide-up">
        {/* Logo */}
        <Image
          src="/logo_extended.png"
          alt="LeadSpy"
          width={140}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />

        {/* Card do formulário */}
        <AuthCard
          badge="LeadSpy Access"
          title="Bem-vindo de volta"
          subtitle="Entre com suas credenciais para acessar o dashboard."
          action={<ThemeToggle />}
          className="w-full"
        >
          <LoginForm />
        </AuthCard>
      </div>
    </AuthLayout>
  )
}
