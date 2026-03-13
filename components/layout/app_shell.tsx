"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { AppSidebar } from "@/components/layout/app_sidebar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSessionRefresh } from "@/hooks/use_session_refresh"

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
  "/dashboard/assinatura": "Assinatura",
  "/dashboard/conta": "Minha Conta",
  "/dashboard/afiliado": "Venda como Afiliado",
}

function getPageTitle(pathname: string): string {
  return pageTitles[pathname] ?? "LeadSpy"
}

function TopBar({
  user,
  pageTitle,
}: {
  user: AppShellUser
  pageTitle: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          aria-label="Abrir menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.5} />
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className="w-60 p-0">
          <AppSidebar user={user} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">{pageTitle}</span>
      </div>
    </header>
  )
}

export function AppShell({ children, user, accessTokenExpiresAt }: AppShellProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  useSessionRefresh(accessTokenExpiresAt)

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar — visível apenas em md+ */}
      <aside className="hidden w-60 shrink-0 border-r border-border md:flex md:flex-col">
        <AppSidebar user={user} />
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
