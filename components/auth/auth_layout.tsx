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
        "relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12",
        className
      )}
    >
      {/* Background base */}
      <div className="pointer-events-none absolute inset-0 bg-[#080c16]" />

      {/* Gradiente radial primário — glow azul no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -5%, oklch(0.60 0.20 264 / 18%) 0%, transparent 65%)",
        }}
      />

      {/* Glow secundário inferior — profundidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 110%, oklch(0.54 0.22 264 / 7%) 0%, transparent 60%)",
        }}
      />

      {/* Grid sutil de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 w-full">{children}</div>
    </main>
  )
}
