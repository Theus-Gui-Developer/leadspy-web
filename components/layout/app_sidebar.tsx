"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  CrownIcon,
  UserIcon,
  MoneyBag01Icon,
  AdvertisimentIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/layout/logout_button"
import { useAvatarStorage } from "@/components/ui/avatar_upload"
import { ThemeToggle } from "@/components/ui/theme_toggle"

type SidebarUser = {
  id: string
  name: string
  email: string
  role: string
}

type AppSidebarProps = {
  user: SidebarUser
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home01Icon },
  { href: "/dashboard/anuncios", label: "Meus Anúncios", icon: AdvertisimentIcon },
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

export function AppSidebar({ user, onClose, collapsed = false, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col overflow-hidden bg-secondary">
      {/* Header */}
      {collapsed ? (
        /* Modo colapsado: apenas botão de expandir centralizado */
        <div className="flex items-center justify-center px-2 py-5">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expandir sidebar"
            title="Expandir sidebar"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowRightDoubleIcon} size={16} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        /* Modo expandido: logo + ThemeToggle + botão de colapsar */
        <div className="flex items-center gap-2 px-4 py-5">
          <Image
            src="/logo_extended.png"
            alt="LeadSpy"
            width={120}
            height={32}
            className="h-8 w-auto flex-1 object-contain object-left"
            priority
          />
          <ThemeToggle />
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Colapsar sidebar"
              title="Colapsar sidebar"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeftDoubleIcon} size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      <Separator />

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-4" aria-label="Navegação principal">
        {collapsed ? (
          /* Nav colapsado: só ícones centralizados */
          <div className="flex flex-col items-center gap-0.5 px-2">
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
                  title={link.label}
                  aria-label={link.label}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={link.icon}
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="shrink-0"
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          /* Nav expandido: ícone + label */
          <div className="flex flex-col gap-0.5 px-3">
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
                    "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
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
          </div>
        )}
      </nav>

      <Separator />

      {/* Footer: usuário + ações */}
      {collapsed ? (
        /* Footer colapsado: avatar + ThemeToggle + logout empilhados e centralizados */
        <div className="flex flex-col items-center gap-1 px-2 py-4">
          <SidebarAvatar user={user} />
          <ThemeToggle />
          <LogoutButton />
        </div>
      ) : (
        /* Footer expandido: avatar + nome/email + ThemeToggle + logout */
        <div className="px-3 py-4">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
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
      )}
    </div>
  )
}

export function MobileSidebar({ user }: { user: SidebarUser }) {
  return <AppSidebar user={user} collapsed={false} />
}
