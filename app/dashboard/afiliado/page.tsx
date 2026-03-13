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
    bg: "bg-primary/10",
    icon: "text-primary",
    highlight: "text-primary",
    bar: "bg-primary",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    highlight: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    highlight: "text-amber-400",
    bar: "bg-amber-500",
  },
  violet: {
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    highlight: "text-violet-400",
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
        <div className="relative overflow-hidden rounded-md border border-primary/20 bg-card">
          {/* Malha de pontos decorativa */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.6 0.2 264) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Glow radial central */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.6_0.2_264_/_10%),transparent)]" />

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
                + renovações recorrentes
              </p>
            </div>

            {/* Separador vertical */}
            <div className="hidden h-32 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent lg:block" />

            {/* Copy */}
            <div className="flex-1 space-y-5">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Venda o LeadSpy e construa{" "}
                  <span className="text-primary">renda recorrente</span>
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
                  className="gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HugeiconsIcon icon={RocketIcon} size={16} />
                  Quero ser afiliado
                </Button>
                <span className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon
                    icon={DiamondIcon}
                    size={12}
                    className="text-primary"
                  />
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
                className="group relative overflow-hidden rounded-md border border-border/60 bg-card p-5 transition-colors hover:border-border"
              >
                {/* Barra de cor no topo */}
                <div
                  className={`absolute inset-x-0 top-0 h-[2px] ${c.bar} opacity-50`}
                />

                {/* Ícone */}
                <div
                  className={`mb-4 flex size-10 items-center justify-center rounded-sm ${c.bg}`}
                >
                  <HugeiconsIcon icon={b.icon} size={18} className={c.icon} />
                </div>

                {/* Conteúdo */}
                <p className="mb-0.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
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
                <div className="absolute top-9 right-0 hidden h-px w-1/2 translate-x-full bg-gradient-to-r from-primary/25 to-transparent sm:block" />
              )}

              <Card className="h-full transition-colors hover:border-border">
                <CardContent className="flex flex-col gap-4 p-5">
                  {/* Número + ícone */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-sm bg-primary/10 ring-1 ring-primary/20">
                      <HugeiconsIcon
                        icon={step.icon}
                        size={16}
                        className="text-primary"
                      />
                    </div>
                    <span className="font-mono text-3xl leading-none font-black text-foreground/10">
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
        <div className="relative overflow-hidden rounded-md border border-primary/15 bg-card p-8">
          {/* Brilho de fundo */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,oklch(0.6_0.2_264_/_6%),transparent)]" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Ícone central */}
            <div className="relative shrink-0">
              <div className="flex size-14 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                <HugeiconsIcon
                  icon={MoneyBag01Icon}
                  size={26}
                  className="text-primary"
                />
              </div>
              <div className="absolute inset-0 -z-10 rounded-md bg-primary opacity-10 blur-2xl" />
            </div>

            {/* Texto */}
            <div className="flex-1 space-y-1.5">
              <p className="text-lg font-bold text-foreground">
                Pronto para monetizar sua audiência?
              </p>
              <p className="text-sm text-muted-foreground">
                Entre na lista de espera e seja um dos primeiros afiliados do
                LeadSpy com{" "}
                <span className="font-semibold text-primary">
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
                className="gap-2 px-6 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HugeiconsIcon icon={RocketIcon} size={16} />
                Entrar na lista de espera
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={12}
                  className="text-emerald-400"
                />
                Sem compromisso · Gratuito
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
