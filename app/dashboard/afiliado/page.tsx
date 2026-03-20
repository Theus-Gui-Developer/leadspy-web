import Link from "next/link"
import Script from "next/script"

import { PageHeader } from "@/components/layout/page_header"
import { CommissionCalculator } from "@/components/dashboard/commission-calculator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FlashIcon,
  Tick02Icon,
  UserAddIcon,
  Share08Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons"

export default function AfilitadoPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Indique e ganhe"
        description="Monetize sua audiência indicando o LeadSpy. Comissões de até 70% por venda."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── COLUNA ESQUERDA: Vídeo + CTAs ── */}
        <div className="flex flex-col gap-4">
          {/* Vídeo VSL */}
          <div className="overflow-hidden rounded-md border border-border/40 bg-black">
            {/* @ts-expect-error – vturb-smartplayer is a custom element registered by the player script */}
            <vturb-smartplayer
              id="vid-69bb65cdd54d8d20f1ffe999"
              style={{ display: "block", margin: "0 auto", width: "100%" }}
            />
            <Script
              src="https://scripts.converteai.net/889b9fb5-4ff6-4d36-9bcd-f8fe563a9649/players/69bb65cdd54d8d20f1ffe999/v4/player.js"
              strategy="afterInteractive"
            />
          </div>

          {/* CTAs abaixo do vídeo */}
          <div className="relative overflow-hidden rounded-md border border-primary/20 bg-card p-5">
            <div className="pointer-events-none absolute top-0 right-0 size-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={FlashIcon} size={12} className="text-primary" />
                <p className="text-xs font-semibold text-foreground">Comece aqui</p>
              </div>

              {/* Dois passos lado a lado */}
              <div className="grid gap-px bg-border/30 sm:grid-cols-2">
                {/* Passo 1 */}
                <div className="flex flex-col gap-3 bg-card py-0.5 pr-4">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                      1
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">Criar conta na PerfectPay</p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Crie sua conta gratuita para receber comissões.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="https://app.perfectpay.com.br/refer/REFPPU15CGKJ1E"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-sm bg-primary/12 text-[11px] font-semibold text-primary ring-1 ring-primary/20 transition-all hover:bg-primary/20"
                  >
                    <HugeiconsIcon icon={UserAddIcon} size={12} />
                    Criar conta
                    <HugeiconsIcon icon={LinkSquare02Icon} size={10} className="opacity-50" />
                  </Link>
                </div>

                {/* Passo 2 */}
                <div className="flex flex-col gap-3 bg-card py-0.5 pl-4">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                      2
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">Afiliar-se ao LeadSpy</p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Obtenha seu link exclusivo rastreável.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="https://app.perfectpay.com.br/afilie/PPPBED61"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-sm border border-border/60 bg-transparent text-[11px] font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-primary/6 hover:text-primary"
                  >
                    <HugeiconsIcon icon={Share08Icon} size={12} />
                    Afiliar-se
                    <HugeiconsIcon icon={LinkSquare02Icon} size={10} className="opacity-50" />
                  </Link>
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                <HugeiconsIcon icon={Tick02Icon} size={10} className="text-emerald-500" />
                Gratuito · Comissões pagas via PerfectPay
              </p>
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA: Banner 70% + Calculadora ── */}
        <div className="flex flex-col gap-6">
          {/* Banner 70% */}
          <div className="relative rounded-md border border-primary/20 bg-card">
            {/* Dot grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, oklch(0.6 0.2 264) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            {/* Top radial glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,oklch(0.6_0.2_264_/_12%),transparent)]" />
            {/* Corner glow */}
            <div className="pointer-events-none absolute -top-12 -left-12 size-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 p-6">
              {/* Badge */}
              <span className="inline-flex w-fit items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold tracking-widest text-primary uppercase">
                <HugeiconsIcon icon={FlashIcon} size={10} />
                Comissão por venda
              </span>

              {/* Número + descrição lado a lado */}
              <div className="flex items-end gap-4">
                <div className="pl-1 pr-6 py-3 -ml-1 -mr-6 -my-3">
                  <p className="bg-gradient-to-br from-foreground via-primary/80 to-primary bg-clip-text font-mono text-[108px] leading-none font-black tracking-tighter text-transparent pr-2.5">
                    70%
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">de comissão</p>
                  <p className="text-xs text-muted-foreground">em cada venda</p>
                </div>
              </div>

              {/* Planos */}
              <div className="grid grid-cols-3 divide-x divide-border/40 border-y border-border/40 py-3.5">
                <div className="flex flex-col gap-0.5 pr-4">
                  <p className="font-mono text-sm font-bold text-foreground">R$ 67,90</p>
                  <p className="text-[10px] text-muted-foreground">Semestral</p>
                </div>
                <div className="flex flex-col gap-0.5 px-4">
                  <p className="font-mono text-sm font-bold text-foreground">R$ 102,90</p>
                  <p className="text-[10px] text-muted-foreground">Anual</p>
                </div>
                <div className="flex flex-col gap-0.5 pl-4">
                  <p className="font-mono text-sm font-bold text-primary">R$ 172,90</p>
                  <p className="text-[10px] text-muted-foreground">Vitalício</p>
                </div>
              </div>

              {/* Copy */}
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground">
                  Indique e <span className="text-primary">ganhe por cada venda</span>
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Seu link rastreável. Cada conversão gera comissão automática na PerfectPay.
                </p>
              </div>
            </div>
          </div>

          {/* Calculadora */}
          <div className="rounded-md border border-border/60 bg-card p-6">
            <div className="mb-5 space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Veja quanto você pode ganhar</h3>
              <p className="text-xs text-muted-foreground">
                Escolha a quantidade de vendas e visualize o potencial da sua comissão.
              </p>
            </div>
            <CommissionCalculator />
          </div>
        </div>
      </div>
    </div>
  )
}
