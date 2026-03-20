import Link from "next/link"

import { ArrowRight01Icon, FlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function AffiliateBanner() {
  return (
    <div className="relative overflow-hidden rounded-md border border-primary/20 bg-card">
      {/* Malha de pontos decorativa */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow radial central */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 10%, transparent), transparent)",
        }}
      />

      {/* Glow lateral direito */}
      <div className="pointer-events-none absolute top-0 right-0 size-96 translate-x-1/4 -translate-y-1/4 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col items-center gap-8 px-8 py-14 text-center lg:flex-row lg:items-center lg:gap-16 lg:text-left">
        {/* Número gigante de comissão */}
        <div className="shrink-0">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            {/* Label acima */}
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-widest text-primary uppercase">
              <HugeiconsIcon icon={FlashIcon} size={11} />
              Comissão por venda
            </span>

            {/* O número */}
            <span className="bg-gradient-to-br from-foreground via-primary/80 to-primary bg-clip-text pr-2 font-mono text-[96px] leading-[1.1] font-black tracking-tighter text-transparent lg:text-[112px]">
              70%
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            comissao em cada venda
          </p>
        </div>

        {/* Separador vertical */}
        <div className="hidden h-32 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent lg:block" />

        {/* Copy */}
        <div className="flex-1 space-y-5">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Indique o LeadSpy e receba comissões de até{" "}
              <span className="text-primary whitespace-nowrap">R$ 172,90 por venda</span>
            </h2>
            <p className="max-w-lg text-base text-muted-foreground">
              Monetize sua audiência com uma oferta de alta conversão e comissão
              agressiva em todos os planos elegíveis.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/dashboard/afiliado"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-primary/25 bg-primary/10 px-5 text-sm font-semibold text-foreground outline-none transition-colors select-none hover:bg-primary/15 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px"
            >
              Ver como funciona
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
