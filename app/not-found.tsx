import Link from "next/link"

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[#080c16]" />

      {/* Glow azul no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% -5%, oklch(0.60 0.20 264 / 14%) 0%, transparent 65%)",
        }}
      />

      {/* Grid sutil */}
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
      <div className="relative z-10 flex flex-col items-center gap-8 text-center animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10"
            style={{
              boxShadow: "0 0 0 1px oklch(0.60 0.20 264 / 8%)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z"
                stroke="oklch(0.60 0.20 264)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="oklch(0.60 0.20 264)"
                fillOpacity="0.9"
              />
              <circle cx="12" cy="12" r="1.2" fill="white" />
            </svg>
          </div>
          <span
            className="text-base font-semibold tracking-tight text-foreground"
            style={{ letterSpacing: "-0.02em" }}
          >
            Lead<span className="text-primary">Spy</span>
          </span>
        </div>

        {/* Código 404 */}
        <div className="space-y-1">
          <p
            className="text-8xl font-bold tabular-nums leading-none tracking-tighter"
            style={{
              color: "oklch(0.60 0.20 264 / 25%)",
              textShadow: "0 0 80px oklch(0.60 0.20 264 / 15%)",
            }}
          >
            404
          </p>
        </div>

        {/* Mensagem */}
        <div className="max-w-sm space-y-3">
          <h1 className="text-xl font-semibold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A página que você está procurando não existe ou foi movida. Verifique
            o endereço ou volte para uma área conhecida.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            style={{
              boxShadow: "0 4px 20px oklch(0.60 0.20 264 / 20%)",
            }}
          >
            Voltar ao Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    </div>
  )
}
