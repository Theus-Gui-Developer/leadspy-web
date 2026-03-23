"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/layout/app_sidebar"
import { useSessionRefresh } from "@/hooks/use_session_refresh"
import { cn } from "@/lib/utils"

const TopBar = dynamic(
  () => import("@/components/layout/top_bar").then((m) => m.TopBar),
  { ssr: false },
)

type AppShellUser = {
  id: string
  name: string
  email: string
  role: string
}

type AppShellProps = {
  children: React.ReactNode
  user: AppShellUser
  accessTokenExpiresAt: string
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/anuncios": "Meus Anúncios",
  "/dashboard/analise-funil-de-pagina": "Análise de funil",
  "/dashboard/assinatura": "Assinatura",
  "/dashboard/conta": "Minha Conta",
  "/dashboard/tutoriais": "Tutoriais",
  "/dashboard/afiliado": "Indique e ganhe",
}

function getPageTitle(pathname: string): string {
  return pageTitles[pathname] ?? "AdSniper"
}


export function AppShell({ children, user, accessTokenExpiresAt }: AppShellProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const [collapsed, setCollapsed] = useState(false)

  useSessionRefresh(accessTokenExpiresAt)

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar — visível apenas em md+ */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border md:flex md:flex-col",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-14" : "w-60",
        )}
      >
        <AppSidebar
          user={user}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* Área principal */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <TopBar user={user} pageTitle={pageTitle} />

        {/* Conteúdo dinâmico */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
