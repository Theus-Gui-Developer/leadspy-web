"use client"

import React, { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, ReloadIcon } from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/layout/page_header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { FunnelUrlForm } from "@/components/funnel-analysis/funnel-url-form"
import { FunnelEmptyState } from "@/components/funnel-analysis/funnel-empty-state"
import { FunnelAnalyzingState } from "@/components/funnel-analysis/funnel-analyzing-state"
import { FunnelImagesPanel } from "@/components/funnel-analysis/funnel-images-panel"
import { FunnelMarkdownPanel } from "@/components/funnel-analysis/funnel-markdown-panel"
import { FunnelMapPanel } from "@/components/funnel-analysis/funnel-map-panel"
import { FunnelResultCard } from "@/components/funnel-analysis/funnel-result-card"
import type { FunnelAnalysisResult } from "@/lib/funnel-analysis/types"

type AnalysisState =
  | { status: "idle" }
  | { status: "loading"; url: string }
  | { status: "success"; result: FunnelAnalysisResult }
  | { status: "error"; message: string }

function SuccessWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.timeEnd("[page] render completo")
    console.log("[page] ✓ todos os painéis renderizados (useEffect disparou)")
  }, [])
  return <>{children}</>
}

export function FunnelAnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" })

  async function handleAnalyze(url: string) {
    setAnalysis({ status: "loading", url })

    try {
      const response = await fetch("/api/funnel-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const json = (await response.json()) as
        | { ok: true; analysis: FunnelAnalysisResult }
        | { ok: false; message: string }

      console.log("[page] response.json() parseado — json.ok =", json.ok)

      if (!json.ok) {
        setAnalysis({ status: "error", message: json.message })
        return
      }

      console.log("[page] chamando setAnalysis(success)...")
      console.time("[page] render completo")
      setAnalysis({ status: "success", result: json.analysis })
      console.log("[page] setAnalysis chamado — aguardando render React...")
    } catch {
      setAnalysis({
        status: "error",
        message: "Não foi possível analisar o funil. Verifique sua conexão e tente novamente.",
      })
    }
  }

  function handleReset() {
    setAnalysis({ status: "idle" })
  }

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Análise de Funil de Página"
        description="Cole a URL de destino de um anúncio para mapear slugs, checkouts, subdomínios, rastreadores e extrair o conteúdo para análise com IA."
      />

      {/* ── Formulário ────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <FunnelUrlForm
            onSubmit={handleAnalyze}
            isLoading={analysis.status === "loading"}
          />
        </CardContent>
      </Card>

      {/* ── Estado: vazio ─────────────────────────────────────────────────── */}
      {analysis.status === "idle" && (
        <Card>
          <CardContent className="p-6">
            <FunnelEmptyState />
          </CardContent>
        </Card>
      )}

      {/* ── Estado: carregando ────────────────────────────────────────────── */}
      {analysis.status === "loading" && (
        <Card>
          <CardContent className="p-6">
            <FunnelAnalyzingState />
          </CardContent>
        </Card>
      )}

      {/* ── Estado: erro ──────────────────────────────────────────────────── */}
      {analysis.status === "error" && (
        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-destructive" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">Falha na análise</p>
                <p className="text-sm text-muted-foreground">{analysis.message}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Estado: sucesso ───────────────────────────────────────────────── */}
      {analysis.status === "success" && (
        <SuccessWrapper>
          <div className="space-y-4">
            <FunnelResultCard result={analysis.result} />
            <FunnelImagesPanel result={analysis.result} />
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                Mapa do domínio
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <FunnelMapPanel rootDomain={analysis.result.rootDomain} />

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
                Análise com IA
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <FunnelMarkdownPanel result={analysis.result} />

            <div className="flex justify-center pt-2 pb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2 text-muted-foreground"
              >
                <HugeiconsIcon icon={ReloadIcon} size={14} />
                Analisar outra URL
              </Button>
            </div>
          </div>
        </SuccessWrapper>
      )}
    </div>
  )
}
