"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { AppSidebar } from "@/components/layout/app_sidebar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

type AppShellUser = {
  id: string
  name: string
  email: string
  role: string
}

export function TopBar({
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
