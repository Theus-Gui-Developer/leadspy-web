import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

type AuthLayoutProps = {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12 bg-background",
        className
      )}
    >
      {/* Gradiente radial primário — glow no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -5%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* Glow secundário inferior — profundidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 110%, color-mix(in oklch, var(--primary) 7%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* Grid sutil de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 w-full">{children}</div>
    </main>
  )
}
