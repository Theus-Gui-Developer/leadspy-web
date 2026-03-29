"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlayIcon,
  Locker01Icon,
  Search01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/layout/page_header"
import { cn } from "@/lib/utils"

type Lesson = {
  id: number
  title: string
  available: boolean
  description?: string
  videoDataUrl?: string
}

const BUNNY_BASE = "https://prod-hostvsl.b-cdn.net/bf740540-7398-4153-9db7-a41a6866c02d"

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Como Instalar a Extensão",
    available: true,
    description:
      "Aprenda passo a passo como instalar o AdSniper no Chrome e configurar a extensão para começar a espiar os melhores anúncios do mercado.",
    videoDataUrl: `${BUNNY_BASE}/b4dc46ba-90a5-4494-8849-8a5359ba6234/videoInformations.js?VIDEO_ORIGIN=ORIGINAL`,
  },
  {
    id: 2,
    title: "Indique e Ganhe",
    available: true,
    description:
      "Veja como se tornar afiliado, gerar seu link rastreável e começar a faturar comissões por cada indicação convertida.",
    videoDataUrl: `${BUNNY_BASE}/0a122571-bb29-4bc9-8d39-c6a9c201b55c/videoInformations.js?VIDEO_ORIGIN=ORIGINAL`,
  },
  {
    id: 3,
    title: "Entenda como funciona o AdSniper",
    available: true,
    description:
      "Um tour completo pela plataforma: entenda cada funcionalidade e como tirar o máximo proveito do AdSniper na sua operação.",
    videoDataUrl: `${BUNNY_BASE}/3b047c1e-db68-4e58-bdc1-84192e74864a/videoInformations.js?VIDEO_ORIGIN=ORIGINAL`,
  },
  {
    id: 4,
    title: "Análise de Funil",
    available: true,
    description:
      "Aprenda a analisar o funil completo de um anunciante — da copy do anúncio até a página de vendas — e extraia insights para suas próprias campanhas.",
    videoDataUrl: `${BUNNY_BASE}/ad193465-2e78-493f-b138-132066cc5cd0/videoInformations.js?VIDEO_ORIGIN=ORIGINAL`,
  },
  {
    id: 5,
    title: "VSL Site",
    available: true,
    description:
      "Descubra como criar e hospedar sua própria VSL, integrar ao seu site e usar o que aprendeu com os anúncios espionados para converter mais.",
    videoDataUrl: `${BUNNY_BASE}/647385ac-46ed-48f1-bad5-6281779757ae/videoInformations.js?VIDEO_ORIGIN=ORIGINAL`,
  },
]

const BUNNY_SCRIPT = "https://script-prod.b-cdn.net/V0.530/"

function BunnyPlayer({ videoDataUrl }: { videoDataUrl: string }) {
  return (
    <div style={{ padding: "56.25% 0 0 0", position: "relative", overflow: "hidden" }}>
      <iframe
        src={`${BUNNY_SCRIPT}?videoData=${videoDataUrl}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          border: "none",
        }}
        allow="fullscreen"
        referrerPolicy="unsafe-url"
      />
    </div>
  )
}

export default function TutoriaisPage() {
  const [activeId, setActiveId] = useState(1)
  const [search, setSearch] = useState("")

  const active = lessons.find((l) => l.id === activeId) ?? lessons[0]
  const filtered = search
    ? lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    : lessons

  const availableCount = lessons.filter((l) => l.available).length

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Tutoriais"
        description="Aprenda a usar o AdSniper e maximize seus resultados."
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] xl:grid-cols-[5fr_3fr]">
        {/* ── Player + info ── */}
        <div className="flex flex-col gap-4">
          {/* Player */}
          <div className="overflow-hidden rounded-md border border-border bg-black">
            {active.videoDataUrl ? (
              <BunnyPlayer key={active.id} videoDataUrl={active.videoDataUrl} />
            ) : active.available ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <svg viewBox="0 0 24 24" className="size-7 translate-x-0.5 fill-white/80" aria-hidden>
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </div>
                <p className="text-sm text-white/50">{active.title}</p>
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <HugeiconsIcon icon={Locker01Icon} size={22} className="text-white/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/70">Em breve</p>
                  <p className="mt-0.5 text-xs text-white/40">Esta aula ainda está sendo produzida.</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="rounded-md border border-border bg-card px-6 py-5">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Aula {active.id} de {lessons.length}
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-foreground">{active.title}</h2>
            {active.description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{active.description}</p>
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground">
                Em produção — disponível em breve.
              </p>
            )}
          </div>
        </div>

        {/* ── Playlist ── */}
        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-sm font-bold text-foreground">Aulas</p>
            <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {availableCount} de {lessons.length}
            </span>
          </div>

          {/* Search */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2">
              <HugeiconsIcon icon={Search01Icon} size={14} className="shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar aula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 divide-y divide-border overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhuma aula encontrada.
              </p>
            ) : (
              filtered.map((lesson) => {
                const isActive = lesson.id === activeId
                const isAvailable = lesson.available

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => isAvailable && setActiveId(lesson.id)}
                    className={cn(
                      "group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors",
                      isActive
                        ? "bg-primary/10"
                        : isAvailable
                          ? "hover:bg-muted/50"
                          : "cursor-default opacity-60",
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/15 text-primary"
                          : isAvailable
                            ? "border-border bg-muted text-muted-foreground group-hover:border-primary/20 group-hover:bg-primary/8 group-hover:text-primary"
                            : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon
                        icon={isAvailable ? PlayIcon : Locker01Icon}
                        size={14}
                        strokeWidth={isActive ? 2 : 1.5}
                      />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-snug",
                          isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground",
                        )}
                      >
                        {lesson.title}
                      </p>
                      {!isAvailable && (
                        <div className="mt-1">
                          <span className="inline-block rounded-sm border border-border bg-muted px-1.5 py-px text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Em breve
                          </span>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="shrink-0 text-primary" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
