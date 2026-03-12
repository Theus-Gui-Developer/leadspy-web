import { redirect } from "next/navigation"

import { AppShell } from "@/components/layout/app_shell"
import { getMe } from "@/lib/api/get_me"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getMe()

  if (!result.ok) {
    redirect("/login")
  }

  const { user, session } = result

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      accessTokenExpiresAt={session.accessTokenExpiresAt}
    >
      {children}
    </AppShell>
  )
}
