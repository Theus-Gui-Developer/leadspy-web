"use client"

import { useState, useEffect, useRef } from "react"

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRef = useRef(true)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!autoRef.current) return
      setSales((prev) => {
        if (prev >= 500) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return prev
        }
        const step = prev > 300 ? 4 : prev > 100 ? 2 : 1
        return prev + step
      })
    }, 40)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function stopAuto() {
    if (!autoRef.current) return
    autoRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const best = plans[plans.length - 1]
  const bestTotal = best.commission * sales
  const percentage = ((sales - 1) / (1000 - 1)) * 100

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
      <div className="space-y-3">
        {/* Contador */}
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="font-mono text-3xl font-black tabular-nums text-foreground">
            {sales.toLocaleString("pt-BR")}
          </span>
          <span className="text-sm text-muted-foreground">
            {sales === 1 ? "venda" : "vendas"}
          </span>
        </div>

        {/* Track customizado */}
        <div className="group relative flex items-center py-3">
          {/* Track background */}
          <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-muted/40" />

          {/* Track filled */}
          <div
            className="pointer-events-none absolute left-0 h-2 rounded-full bg-gradient-to-r from-primary/70 to-primary shadow-[0_0_8px_2px_oklch(0.6_0.2_264_/_0.25)] transition-[width] duration-[40ms]"
            style={{ width: `${percentage}%` }}
          />

          {/* Input nativo invisível (só o thumb aparece) */}
          <input
            type="range"
            min={1}
            max={1000}
            value={sales}
            onChange={(e) => { stopAuto(); setSales(Number(e.target.value)) }}
            onMouseDown={stopAuto}
            onTouchStart={stopAuto}
            className="relative z-10 w-full cursor-pointer appearance-none bg-transparent
              [&::-webkit-slider-runnable-track]:h-2
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:size-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_oklch(0.6_0.2_264_/_0.45),0_2px_6px_rgba(0,0,0,0.5)]
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-100
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-webkit-slider-thumb]:active:scale-110
              [&::-moz-range-track]:h-2
              [&::-moz-range-track]:rounded-full
              [&::-moz-range-track]:bg-transparent
              [&::-moz-range-thumb]:size-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border-none
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:shadow-[0_0_0_3px_oklch(0.6_0.2_264_/_0.45)]
            "
          />
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground/40">
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
              <p className={`mt-1.5 font-mono text-lg font-bold tabular-nums ${plan.highlight ? "text-primary" : "text-foreground"}`}>
                {formatBRL(total)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
