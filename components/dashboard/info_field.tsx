"use client"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"

type InfoFieldProps = {
  label: string
  value: string
  copyable?: boolean
  mono?: boolean
  className?: string
}

export function InfoField({ label, value, copyable = false, mono = false, className }: InfoFieldProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silencioso
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p
          className={cn(
            "flex-1 truncate text-sm text-foreground",
            mono && "font-mono text-xs text-foreground/80"
          )}
        >
          {value}
        </p>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "shrink-0 rounded-md p-1 transition-colors",
              copied
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            )}
            aria-label={copied ? "Copiado!" : `Copiar ${label}`}
          >
            <HugeiconsIcon
              icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
              size={13}
            />
          </button>
        )}
      </div>
    </div>
  )
}
