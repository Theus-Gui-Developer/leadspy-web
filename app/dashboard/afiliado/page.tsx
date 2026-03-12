import { PageHeader } from "@/components/layout/page_header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoneyBag01Icon,
  PercentCircleIcon,
  UserGroupIcon,
  DollarReceiveIcon,
  RocketIcon,
  Share01Icon,
  ChartBarIncreasingIcon,
  DiamondIcon,
  FlashIcon,
  Tick02Icon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons"

const benefits = [
  {
    icon: PercentCircleIcon,
    label: "Comissão",
    highlight: "até 70%",
    description:
      "Uma das maiores comissões do mercado digital. Cada indicação sua rende.",
    color: "blue" as const,
  },
  {
    icon: DollarReceiveIcon,
    label: "Recorrência",
    highlight: "todo mês",
    description:
      "Comissão em cada renovação — não só na primeira venda. Renda passiva real.",
    color: "emerald" as const,
  },
  {
    icon: ChartBarIncreasingIcon,
    label: "Conversão",
    highlight: "altíssima",
    description:
      "O LeadSpy resolve uma dor concreta. O produto se vende praticamente sozinho.",
    color: "amber" as const,
  },
  {
    icon: UserGroupIcon,
    label: "Suporte",
    highlight: "dedicado",
    description:
      "Time de afiliados disponível para te ajudar a escalar suas indicações.",
    color: "violet" as const,
  },
]

const colorMap = {
  blue: {
    bg: "bg-[#3c83f6]/10",
    icon: "text-[#3c83f6]",
    highlight: "text-[#3c83f6]",
    glow: "group-hover:shadow-[0_0_28px_-4px_rgba(60,131,246,0.3)]",
    ring: "group-hover:ring-[#3c83f6]/30",
    bar: "bg-[#3c83f6]",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    highlight: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_28px_-4px_rgba(52,211,153,0.3)]",
    ring: "group-hover:ring-emerald-500/30",
    bar: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    highlight: "text-amber-400",
    glow: "group-hover:shadow-[0_0_28px_-4px_rgba(251,191,36,0.3)]",
    ring: "group-hover:ring-amber-500/30",
    bar: "bg-amber-500",
  },
  violet: {
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    highlight: "text-violet-400",
    glow: "group-hover:shadow-[0_0_28px_-4px_rgba(167,139,250,0.3)]",
    ring: "group-hover:ring-violet-500/30",
    bar: "bg-violet-500",
  },
}

const steps = [
  {
    icon: Share01Icon,
    number: "01",
    title: "Solicite seu acesso",
    description:
      "Entre na lista de espera. Nossa equipe irá entrar em contato com você assim que o programa abrir.",
  },
  {
    icon: MagicWand01Icon,
    number: "02",
    title: "Receba seu link exclusivo",
    description:
      "Você ganha um link rastreável único com dashboard completo de conversões e comissões.",
  },
  {
    icon: MoneyBag01Icon,
    number: "03",
    title: "Divulgue e lucre",
    description:
      "Compartilhe para sua audiência. A cada assinatura gerada, sua comissão é creditada automaticamente.",
  },
]

export default function AfilitadoPage() {
  return (
    <div className="animate-fade-in space-y-10">
      <PageHeader
        title="Programa de Afiliados"
        description="Monetize sua audiência indicando o LeadSpy. Comissões recorrentes e altíssimas."
      />

      {/* ── HERO ── */}
      <section>
        <div className="relative overflow-hidden rounded-2xl border border-[#3c83f6]/20 bg-gradient-to-br from-[#0a0f1e] via-[#0d1321] to-[#111827]">
          {/* Malha de pontos decorativa */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #3c83f6 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Glow radial central */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(60,131,246,0.12),transparent)]" />

          {/* Glow lateral direito */}
          <div className="pointer-events-none absolute right-0 top-0 size-96 -translate-y-1/4 translate-x-1/4 rounded-full bg-[#3c83f6]/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8 px-8 py-14 text-center lg:flex-row lg:items-center lg:gap-16 lg:text-left">
            {/* Número gigante de comissão */}
            <div className="shrink-0">
              <div className="flex flex-col items-center gap-3 lg:items-start">
                {/* Label acima */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3c83f6]/20 bg-[#3c83f6]/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#3c83f6] uppercase">
                  <HugeiconsIcon icon={FlashIcon} size={11} />
                  Comissão por venda
                </span>

                {/* O número */}
                <span className="bg-gradient-to-br from-white via-[#93b4fc] to-[#3c83f6] bg-clip-text font-mono text-[96px] font-black leading-[1.1] tracking-tighter text-transparent lg:text-[112px]">
                  70%
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                + renovações recorrentes
              </p>
            </div>

            {/* Separador vertical */}
            <div className="hidden h-32 w-px bg-gradient-to-b from-transparent via-[#3c83f6]/20 to-transparent lg:block" />

            {/* Copy */}
            <div className="flex-1 space-y-5">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Venda o LeadSpy e construa{" "}
                  <span className="text-[#3c83f6]">renda recorrente</span>
                </h2>
                <p className="max-w-lg text-base text-muted-foreground">
                  Um dos maiores programas de afiliados de ferramentas para
                  anunciantes digitais. Indique, converta e receba — mês após
                  mês.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button
                  disabled
                  size="lg"
                  className="gap-2 bg-[#3c83f6] text-white hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HugeiconsIcon icon={RocketIcon} size={16} />
                  Quero ser afiliado
                </Button>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon icon={DiamondIcon} size={12} className="text-[#3c83f6]" />
                  Programa em breve
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Por que se tornar afiliado?
          </h3>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => {
            const c = colorMap[b.color]
            return (
              <div
                key={b.label}
                className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d1321] p-5 transition-all duration-300 ring-1 ring-transparent ${c.ring} ${c.glow}`}
              >
                {/* Barra de cor no topo */}
                <div className={`absolute inset-x-0 top-0 h-[2px] ${c.bar} opacity-60`} />

                {/* Ícone */}
                <div className={`mb-4 flex size-11 items-center justify-center rounded-xl ${c.bg}`}>
                  <HugeiconsIcon icon={b.icon} size={20} className={c.icon} />
                </div>

                {/* Conteúdo */}
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {b.label}
                </p>
                <p className={`mb-2 text-xl font-bold ${c.highlight}`}>
                  {b.highlight}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Como funciona
          </h3>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Linha conectora (exceto último) */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-9 hidden h-px w-1/2 translate-x-full bg-gradient-to-r from-[#3c83f6]/30 to-transparent sm:block" />
              )}

              <Card className="h-full border-white/[0.06] bg-[#0d1321] ring-1 ring-transparent transition-all duration-300 hover:ring-[#3c83f6]/20 hover:shadow-[0_0_24px_-6px_rgba(60,131,246,0.2)]">
                <CardContent className="flex flex-col gap-4 p-6">
                  {/* Número + ícone */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#3c83f6]/10 ring-1 ring-[#3c83f6]/20">
                      <HugeiconsIcon
                        icon={step.icon}
                        size={18}
                        className="text-[#3c83f6]"
                      />
                    </div>
                    <span className="font-mono text-3xl font-black text-white/10 leading-none">
                      {step.number}
                    </span>
                  </div>

                  {/* Texto */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section>
        <div className="relative overflow-hidden rounded-2xl border border-[#3c83f6]/15 bg-gradient-to-r from-[#0a0f1e] via-[#0d1321] to-[#0a0f1e] p-8">
          {/* Brilho de fundo */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,rgba(60,131,246,0.06),transparent)]" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Ícone central */}
            <div className="relative shrink-0">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#3c83f6]/10 ring-1 ring-[#3c83f6]/20">
                <HugeiconsIcon
                  icon={MoneyBag01Icon}
                  size={30}
                  className="text-[#3c83f6]"
                />
              </div>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-[#3c83f6] opacity-15 blur-2xl" />
            </div>

            {/* Texto */}
            <div className="flex-1 space-y-1.5">
              <p className="text-lg font-bold text-foreground">
                Pronto para monetizar sua audiência?
              </p>
              <p className="text-sm text-muted-foreground">
                Entre na lista de espera e seja um dos primeiros afiliados do
                LeadSpy com{" "}
                <span className="font-semibold text-[#3c83f6]">
                  até 70% de comissão recorrente
                </span>
                .
              </p>
            </div>

            {/* Botão + resultado esperado */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <Button
                disabled
                size="lg"
                className="gap-2 bg-[#3c83f6] px-6 text-white hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HugeiconsIcon icon={RocketIcon} size={16} />
                Entrar na lista de espera
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <HugeiconsIcon icon={Tick02Icon} size={12} className="text-emerald-400" />
                Sem compromisso · Gratuito
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
