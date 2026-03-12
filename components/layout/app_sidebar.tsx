"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  CrownIcon,
  UserIcon,
  MoneyBag01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/layout/logout_button"
import { useAvatarStorage } from "@/components/ui/avatar_upload"

type SidebarUser = {
  id: string
  name: string
  email: string
  role: string
}

type AppSidebarProps = {
  user: SidebarUser
  onClose?: () => void
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home01Icon },
  { href: "/dashboard/assinatura", label: "Assinatura", icon: CrownIcon },
  { href: "/dashboard/afiliado", label: "Venda como Afiliado", icon: MoneyBag01Icon },
  { href: "/dashboard/conta", label: "Minha Conta", icon: UserIcon },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function SidebarAvatar({ user }: { user: SidebarUser }) {
  const { avatarUrl } = useAvatarStorage(user.id)
  const initials = getInitials(user.name)

  return (
    <div className="relative size-8 shrink-0">
      <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-primary/20">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={user.name} className="size-full rounded-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-primary">{initials}</span>
        )}
      </div>
      {/* Indicador online */}
      <span className="absolute right-0 bottom-0 size-2 rounded-full border border-background bg-emerald-500" />
    </div>
  )
}

export function AppSidebar({ user, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-secondary">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <circle
              cx="12"
              cy="12"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.6"
            />
            <circle
              cx="12"
              cy="12"
              r="11"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
          </svg>
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">
          LeadSpy
        </span>
      </div>

      <Separator />

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "border-l-2 border-primary bg-primary/10 pl-[10px] text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <HugeiconsIcon
                icon={link.icon}
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Usuário + Logout */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <SidebarAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar({ user }: { user: SidebarUser }) {
  return <AppSidebar user={user} />
}
