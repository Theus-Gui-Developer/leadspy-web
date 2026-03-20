"use client"

import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading_spinner"

const STEPS = [
  "Acessando URL inicial...",
  "Rastreando redirecionamentos...",
  "Identificando plataforma...",
  "Detectando sinais e scripts...",
  "Classificando tipo de página...",
  "Extraindo conteúdo...",
]

const STEP_DURATION_MS = 2800

export function FunnelAnalyzingState() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, STEP_DURATION_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <LoadingSpinner size="lg" label="Analisando funil..." />

      <div className="w-full max-w-xs space-y-3">
        <p className="text-sm font-medium text-foreground">Analisando funil de vendas</p>

        {/* Steps com indicadores */}
        <div className="space-y-1.5 text-left">
          {STEPS.map((step, i) => {
            const isDone = i < stepIndex
            const isCurrent = i === stepIndex

            return (
              <div
                key={step}
                className={`flex items-center gap-2.5 text-xs transition-all duration-500 ${
                  isDone
                    ? "text-muted-foreground/40"
                    : isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground/25"
                }`}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-sm text-[9px] font-bold transition-all duration-500 ${
                    isDone
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : isCurrent
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground/30"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className={isCurrent ? "font-medium" : ""}>{step}</span>
                {isCurrent && (
                  <span className="ml-auto animate-pulse text-[10px] text-primary">…</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="max-w-xs text-[11px] text-muted-foreground/60">
        Isso pode levar alguns segundos dependendo da página.
      </p>
    </div>
  )
}
