"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return <div className={cn("h-5 w-10 rounded-full bg-white/5", className)} aria-hidden />
  }

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={cn("flex items-center gap-0.5 rounded-full bg-white/8 p-0.5 cursor-pointer", className)}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full transition-all duration-150",
          !isDark
            ? "bg-white/15 text-white"
            : "text-sidebar-foreground/35",
        )}
      >
        <HugeiconsIcon icon={Sun01Icon} size={8} strokeWidth={1.5} />
      </span>
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full transition-all duration-150",
          isDark
            ? "bg-sidebar-primary/20 text-sidebar-primary"
            : "text-sidebar-foreground/35",
        )}
      >
        <HugeiconsIcon icon={Moon01Icon} size={8} strokeWidth={1.5} />
      </span>
    </button>
  )
}
