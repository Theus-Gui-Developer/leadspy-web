"use client"

import { useState } from "react"

const plans = [
  { label: "Semestral", commission: 67.9 },
  { label: "Anual", commission: 102.9 },
  { label: "Vitalício", commission: 172.9, highlight: true },
]

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function CommissionCalculator() {
  const [sales, setSales] = useState(1)

  const best = plans[plans.length - 1]
  const bestTotal = best.commission * sales

  return (
    <div className="space-y-6">
      {/* Resultado destaque */}
      <div className="relative overflow-hidden rounded-md border border-primary/15 bg-primary/5 px-5 py-4 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.6_0.2_264_/_8%),transparent)]" />
        <p className="relative text-xs text-muted-foreground">
          Com{" "}
          <span className="font-semibold text-primary">
            {sales} {sales === 1 ? "venda" : "vendas"}
          </span>{" "}
          você pode gerar até
        </p>
        <p className="relative mt-1 font-mono text-3xl font-black tracking-tight text-primary">
          {formatBRL(bestTotal)}
        </p>
        <p className="relative mt-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
          no plano vitalício
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="font-mono text-2xl font-black text-foreground">{sales.toLocaleString("pt-BR")}</span>
          <span className="text-xs text-muted-foreground">{sales === 1 ? "venda" : "vendas"}</span>
        </div>
        <input
          type="range"
          min={1}
          max={1000}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground/50">
          <span>1 venda</span>
          <span>1.000 vendas</span>
        </div>
      </div>

      {/* Cards por plano */}
      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const total = plan.commission * sales
          return (
            <div
              key={plan.label}
              className={
                plan.highlight
                  ? "relative overflow-hidden rounded-md border border-primary/25 bg-primary/8 px-4 py-3"
                  : "rounded-md border border-border/50 bg-background/50 px-4 py-3"
              }
            >
              {plan.highlight && (
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              )}
              <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
                {plan.label}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                {formatBRL(plan.commission)} × {sales}
              </p>
              <p className={`mt-1.5 font-mono text-lg font-bold ${plan.highlight ? "text-primary" : "text-foreground"}`}>
                {formatBRL(total)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
