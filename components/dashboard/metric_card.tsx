import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type MetricCardVariant = "default" | "primary" | "success" | "warning" | "danger"

type MetricCardProps = {
  title: string
  value: string | React.ReactNode
  description?: string
  icon?: React.ReactNode
  variant?: MetricCardVariant
  className?: string
}

const variantStyles: Record<MetricCardVariant, { card: string; icon: string; title: string }> = {
  default: {
    card: "ring-foreground/10 hover:ring-foreground/20",
    icon: "bg-foreground/5 text-foreground/60",
    title: "text-muted-foreground",
  },
  primary: {
    card: "ring-[#3c83f6]/20 hover:ring-[#3c83f6]/40 hover:shadow-[0_0_20px_-4px_rgba(60,131,246,0.15)]",
    icon: "bg-[#3c83f6]/10 text-[#3c83f6]",
    title: "text-muted-foreground",
  },
  success: {
    card: "ring-emerald-500/20 hover:ring-emerald-500/40 hover:shadow-[0_0_20px_-4px_rgba(16,185,129,0.12)]",
    icon: "bg-emerald-500/10 text-emerald-400",
    title: "text-muted-foreground",
  },
  warning: {
    card: "ring-amber-500/20 hover:ring-amber-500/40 hover:shadow-[0_0_20px_-4px_rgba(245,158,11,0.12)]",
    icon: "bg-amber-500/10 text-amber-400",
    title: "text-muted-foreground",
  },
  danger: {
    card: "ring-red-500/20 hover:ring-red-500/40 hover:shadow-[0_0_20px_-4px_rgba(239,68,68,0.12)]",
    icon: "bg-red-500/10 text-red-400",
    title: "text-muted-foreground",
  },
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        styles.card,
        className
      )}
    >
      <CardContent className="flex items-start gap-4 py-2">
        {icon && (
          <div className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-medium tracking-wide uppercase", styles.title)}>
            {title}
          </p>
          <div className="mt-1 text-xl font-semibold text-foreground">
            {value}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
