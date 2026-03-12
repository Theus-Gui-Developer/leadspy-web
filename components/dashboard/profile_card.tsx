import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AvatarUpload } from "@/components/ui/avatar_upload"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, ShieldCheck } from "@hugeicons/core-free-icons"

type ProfileCardProps = {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  className?: string
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrador",
    customer: "Cliente",
    user: "Usuário",
  }
  return labels[role] ?? role
}

function getRoleBadgeClass(role: string): string {
  if (role === "admin") {
    return "border-transparent bg-[#3c83f6]/15 text-[#3c83f6]"
  }
  return "border-transparent bg-foreground/10 text-muted-foreground"
}

export function ProfileCard({ user, className }: ProfileCardProps) {
  const roleLabel = getRoleLabel(user.role)
  const roleBadgeClass = getRoleBadgeClass(user.role)

  return (
    <div className={cn("flex flex-col items-center gap-4 py-2 text-center", className)}>
      {/* Avatar com upload */}
      <AvatarUpload userId={user.id} name={user.name} size={88} />

      {/* Nome e role */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
        <Badge className={cn("text-xs font-medium", roleBadgeClass)}>
          <HugeiconsIcon icon={ShieldCheck} size={11} className="mr-1" />
          {roleLabel}
        </Badge>
      </div>

      <Separator className="w-full" />

      {/* Email */}
      <div className="w-full space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Mail01Icon} size={14} className="shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>
    </div>
  )
}
