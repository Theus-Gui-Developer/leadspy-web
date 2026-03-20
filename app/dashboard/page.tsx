import Image from "next/image"
import Link from "next/link"

import { AffiliateBanner } from "@/components/dashboard/affiliate-banner"
import { PageHeader } from "@/components/layout/page_header"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChromeIcon,
  Download01Icon,
  FlashIcon,
  Search01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

export default function DashboardPage() {
  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua conta."
      />

      {/* Row 1 — Banner Afiliados + CTA Extensão Chrome */}
      <section className="grid gap-4 lg:grid-cols-[3fr_1fr]">
        {/* 75% — Banner principal */}
        <AffiliateBanner />

        {/* 25% — Card da extensão */}
        <Card className="relative overflow-hidden ring-primary/20 transition-all duration-200 hover:ring-primary/30">
          {/* Glow decorativo */}
          <div className="pointer-events-none absolute top-0 right-0 size-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

          <CardContent className="relative flex h-full flex-col gap-5 py-6">
            {/* Ícone */}
            <div className="relative w-fit">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <HugeiconsIcon icon={ChromeIcon} size={28} className="text-primary" />
              </div>
              <div className="absolute inset-0 -z-10 size-14 rounded-2xl bg-primary opacity-10 blur-lg" />
            </div>

            {/* Texto */}
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Extensão LeadSpy
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Instale no Chrome e espione anúncios direto na Biblioteca do Meta.
              </p>
            </div>

            {/* Versão + botão */}
            <div className="space-y-3">
              <Link
                href="/downloads/leadspy-v1.1.0-release.zip"
                download
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-sm bg-primary/15 text-xs font-medium text-primary ring-1 ring-primary/25 transition-all hover:bg-primary/25"
              >
                <HugeiconsIcon icon={Download01Icon} size={14} />
                Baixar extensão
              </Link>
              <p className="text-center text-[10px] text-muted-foreground/60">
                v1.1.0 · Carregue o ZIP em{" "}
                <code className="text-primary/70">chrome://extensions</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Row 2 — Fluxo de execução */}
      <section className="space-y-4">
        {/* Header da seção */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <HugeiconsIcon icon={FlashIcon} size={11} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Seu fluxo de execução</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Da análise do mercado até a publicação da oferta, organize seu processo em poucos passos.
            </p>
          </div>
        </div>

        {/* Cards de passos */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">

          {/* Passo 1 — AdSniper */}
          <Card className="relative overflow-hidden ring-primary/15 transition-all duration-200 hover:ring-primary/30">
            <div className="pointer-events-none absolute top-0 right-0 select-none font-black text-[80px] leading-none text-foreground/[0.03]">01</div>
            <CardContent className="relative flex h-full flex-col gap-4 py-5">
              <div className="relative w-fit">
                <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-xl" />
                <HugeiconsIcon icon={Search01Icon} size={40} className="relative text-primary" />
              </div>
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">Passo 1</span>
                <p className="text-sm font-semibold text-foreground">Espione ofertas com AdSniper</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Descubra anúncios, criativos e ofertas validadas para analisar com mais precisão.
                </p>
              </div>
              <Link href="/dashboard/anuncios" className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-70">
                Explorar anúncios
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            </CardContent>
          </Card>


          {/* Passo 2 — Replic */}
          <Card className="relative overflow-hidden ring-violet-500/15 transition-all duration-200 hover:ring-violet-500/30">
            <div className="pointer-events-none absolute top-0 right-0 select-none font-black text-[80px] leading-none text-foreground/[0.03]">02</div>
            <CardContent className="relative flex h-full flex-col gap-4 py-5">
              <div className="relative w-fit">
                <div className="absolute inset-0 scale-150 rounded-full bg-violet-500/20 blur-xl" />
                <Image src="/logos/replic.png" alt="Replic" width={40} height={40} className="relative object-contain" />
              </div>
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-semibold tracking-widest text-violet-400 uppercase">Passo 2</span>
                <p className="text-sm font-semibold text-foreground">Crie e clone páginas com a Replic</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Monte páginas com mais velocidade usando templates prontos e edição simples.
                </p>
              </div>
              <Link href="#" className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 transition-opacity hover:opacity-70">
                Testar grátis
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            </CardContent>
          </Card>


          {/* Passo 3 — Host VSL */}
          <Card className="relative overflow-hidden ring-sky-500/15 transition-all duration-200 hover:ring-sky-500/30">
            <div className="pointer-events-none absolute top-0 right-0 select-none font-black text-[80px] leading-none text-foreground/[0.03]">03</div>
            <CardContent className="relative flex h-full flex-col gap-4 py-5">
              <div className="relative w-fit">
                <div className="absolute inset-0 scale-150 rounded-full bg-sky-500/20 blur-xl" />
                <Image src="/logos/host.png" alt="Host VSL" width={40} height={40} className="relative object-contain" />
              </div>
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-semibold tracking-widest text-sky-400 uppercase">Passo 3</span>
                <p className="text-sm font-semibold text-foreground">Hospede sua VSL com a Host VSL</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Suba sua VSL com uma estrutura mais profissional, rápida e confiável.
                </p>
              </div>
              <Link href="#" className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition-opacity hover:opacity-70">
                Testar grátis
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            </CardContent>
          </Card>


          {/* Passo 4 — Perfect Pay */}
          <Card className="relative overflow-hidden ring-emerald-500/15 transition-all duration-200 hover:ring-emerald-500/30">
            <div className="pointer-events-none absolute top-0 right-0 select-none font-black text-[80px] leading-none text-foreground/[0.03]">04</div>
            <CardContent className="relative flex h-full flex-col gap-4 py-5">
              <div className="relative w-fit">
                <div className="absolute inset-0 scale-150 rounded-full bg-emerald-500/20 blur-xl" />
                <Image src="/logos/perfectpay.png" alt="Perfect Pay" width={40} height={40} className="relative object-contain" />
              </div>
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">Passo 4</span>
                <p className="text-sm font-semibold text-foreground">Cadastre seu produto na Perfect Pay</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Conecte sua oferta à plataforma de pagamentos e deixe tudo pronto para vender.
                </p>
              </div>
              <Link href="#" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 transition-opacity hover:opacity-70">
                Cadastrar produto
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  )
}
