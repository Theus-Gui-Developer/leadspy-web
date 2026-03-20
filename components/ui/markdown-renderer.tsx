"use client"

import React from "react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "hr" }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "pre"; lang: string; text: string }
  | { kind: "p"; text: string }

// ---------------------------------------------------------------------------
// Parse inline: **bold**, *italic*, `code`, [link](url)
// ---------------------------------------------------------------------------

function parseInline(text: string, keyPrefix: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  // Order matters: ** before *, longer patterns first
  const re = /(\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\n]+)\))/g
  let last = 0
  let m: RegExpExecArray | null
  let idx = 0

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index))
    }
    const key = `${keyPrefix}-i${idx++}`
    if (m[0].startsWith("**")) {
      parts.push(
        <strong key={key} className="font-semibold text-zinc-900">
          {m[2]}
        </strong>,
      )
    } else if (m[0].startsWith("*")) {
      parts.push(<em key={key}>{m[3]}</em>)
    } else if (m[0].startsWith("`")) {
      parts.push(
        <code key={key} className="rounded bg-zinc-200/80 px-1 py-0.5 font-mono text-[11px] text-zinc-700">
          {m[4]}
        </code>,
      )
    } else if (m[0].startsWith("[")) {
      parts.push(
        <a
          key={key}
          href={m[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
        >
          {m[5]}
        </a>,
      )
    }
    last = m.index + m[0].length
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return parts.length === 0 ? text : <>{parts}</>
}

// ---------------------------------------------------------------------------
// Parse blocks
// ---------------------------------------------------------------------------

function parseBlocks(md: string): Block[] {
  const blocks: Block[] = []
  const lines = md.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    // Blank line
    if (line.trim() === "") {
      i++
      continue
    }

    // Heading: # ## ### …
    const hm = line.match(/^(#{1,6})\s+(.+)$/)
    if (hm) {
      blocks.push({ kind: "heading", level: hm[1]!.length, text: hm[2]! })
      i++
      continue
    }

    // HR: --- or *** or ___
    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks.push({ kind: "hr" })
      i++
      continue
    }

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)/)
    if (fenceMatch) {
      const lang = fenceMatch[1] ?? ""
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!)
        i++
      }
      blocks.push({ kind: "pre", lang, text: codeLines.join("\n") })
      i++ // skip closing ```
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^[-*+]\s+/, ""))
        i++
      }
      blocks.push({ kind: "ul", items })
      continue
    }

    // Ordered list
    if (/^\d+[.)]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\d+[.)]\s+/, ""))
        i++
      }
      blocks.push({ kind: "ol", items })
      continue
    }

    // Paragraph: collect until blank / block start
    const pLines: string[] = []
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]!) &&
      !/^[-*_]{3,}\s*$/.test(lines[i]!) &&
      !/^```/.test(lines[i]!) &&
      !/^[-*+]\s/.test(lines[i]!) &&
      !/^\d+[.)]\s/.test(lines[i]!)
    ) {
      pLines.push(lines[i]!)
      i++
    }
    if (pLines.length > 0) {
      blocks.push({ kind: "p", text: pLines.join("\n") })
    }
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Estilos de heading por nível
// ---------------------------------------------------------------------------

const HEADING_CLS: Record<number, string> = {
  1: "text-xl font-bold text-zinc-900 mt-2",
  2: "text-lg font-bold text-zinc-900 mt-1",
  3: "text-base font-semibold text-zinc-800",
  4: "text-sm font-semibold text-zinc-800",
  5: "text-sm font-medium text-zinc-700",
  6: "text-xs font-medium uppercase tracking-wide text-zinc-500",
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = parseBlocks(content)

  return (
    <div className={cn("space-y-2 text-sm leading-relaxed", className)}>
      {blocks.map((block, i) => {
        const key = `b${i}`
        switch (block.kind) {
          case "heading":
            return (
              <div key={key} className={HEADING_CLS[block.level] ?? "font-semibold text-zinc-800"}>
                {parseInline(block.text, key)}
              </div>
            )

          case "hr":
            return <hr key={key} className="border-zinc-200" />

          case "ul":
            return (
              <ul key={key} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j} className="text-zinc-600">
                    {parseInline(item, `${key}-${j}`)}
                  </li>
                ))}
              </ul>
            )

          case "ol":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j} className="text-zinc-600">
                    {parseInline(item, `${key}-${j}`)}
                  </li>
                ))}
              </ol>
            )

          case "pre":
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-100 p-3 font-mono text-xs leading-relaxed text-zinc-700"
              >
                {block.text}
              </pre>
            )

          case "p":
            return (
              <p key={key} className="text-zinc-600">
                {parseInline(block.text, key)}
              </p>
            )
        }
      })}
    </div>
  )
}
