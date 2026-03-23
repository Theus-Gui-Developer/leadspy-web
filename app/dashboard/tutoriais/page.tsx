"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlayIcon,
  Locker01Icon,
  Search01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/layout/page_header"
import { cn } from "@/lib/utils"

type Lesson = {
  id: number
  title: string
  duration?: string
  available: boolean
  description?: string
  vtubePlayerId?: string
  vtubeScriptSrc?: string
}

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Como baixar e instalar a extensão",
    duration: "5:32",
    available: true,
    description:
      "Aprenda passo a passo como instalar o AdSniper no Chrome e configurar a extensão para começar a espiar os melhores anúncios do mercado.",
    vtubePlayerId: "vid-69bb65d1b1f8e9f7f4eda04a",
    vtubeScriptSrc:
      "https://scripts.converteai.net/889b9fb5-4ff6-4d36-9bcd-f8fe563a9649/players/69bb65d1b1f8e9f7f4eda04a/v4/player.js",
  },
  {
    id: 2,
    title: "Como indicar o AdSniper e ganhar 70% de comissão",
    duration: "8:15",
    available: true,
    description:
      "Veja como se tornar afiliado, gerar seu link rastreável e começar a faturar comissões por cada indicação convertida.",
    vtubePlayerId: "vid-69bb65cdd54d8d20f1ffe999",
    vtubeScriptSrc:
      "https://scripts.converteai.net/889b9fb5-4ff6-4d36-9bcd-f8fe563a9649/players/69bb65cdd54d8d20f1ffe999/v4/player.js",
  },
  {
    id: 3,
    title: "Como escolher uma oferta vencedora",
    available: false,
  },
  {
    id: 4,
    title: "Como clonar e criar sua página de vendas",
    available: false,
  },
  {
    id: 5,
    title: "Como hospedar sua VSL e inserir no seu site",
    available: false,
  },
  {
    id: 6,
    title: "Como cadastrar seu produto na Perfect Pay",
    available: false,
  },
]

const availableCount = lessons.filter((l) => l.available).length

function VturbPlayer({ playerId, scriptSrc }: { playerId: string; scriptSrc: string }) {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = scriptSrc
    script.async = true
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [scriptSrc])

  return (
    // @ts-expect-error – vturb-smartplayer is a custom element registered by the player script
    <vturb-smartplayer
      id={playerId}
      style={{ display: "block", margin: "0 auto", width: "100%" }}
    />
  )
}

export default function TutoriaisPage() {
  const [activeId, setActiveId] = useState(1)
  const [search, setSearch] = useState("")

  const active = lessons.find((l) => l.id === activeId) ?? lessons[0]
  const filtered = search
    ? lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    : lessons

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
            {active.vtubePlayerId && active.vtubeScriptSrc ? (
              <VturbPlayer
                key={active.id}
                playerId={active.vtubePlayerId}
                scriptSrc={active.vtubeScriptSrc}
              />
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
                    onClick={() => setActiveId(lesson.id)}
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
                      <div className="mt-1">
                        {isAvailable ? (
                          lesson.duration && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <HugeiconsIcon icon={Clock01Icon} size={10} />
                              {lesson.duration}
                            </span>
                          )
                        ) : (
                          <span className="inline-block rounded-sm border border-border bg-muted px-1.5 py-px text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Em breve
                          </span>
                        )}
                      </div>
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
