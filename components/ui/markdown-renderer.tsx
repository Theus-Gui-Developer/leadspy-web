"use client"

import { memo } from "react"
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
} from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

const REMARK_PLUGINS = [remarkGfm]

const MARKDOWN_COMPONENTS = {
  h1({ children }) {
    return <h1 className="mt-2 text-xl font-bold text-zinc-900">{children}</h1>
  },
  h2({ children }) {
    return <h2 className="mt-1 text-lg font-bold text-zinc-900">{children}</h2>
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold text-zinc-800">{children}</h3>
  },
  h4({ children }) {
    return <h4 className="text-sm font-semibold text-zinc-800">{children}</h4>
  },
  h5({ children }) {
    return <h5 className="text-sm font-medium text-zinc-700">{children}</h5>
  },
  h6({ children }) {
    return <h6 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{children}</h6>
  },
  p({ children }) {
    return <p className="text-zinc-600">{children}</p>
  },
  a({ children, href, ...props }) {
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
      >
        {children}
      </a>
    )
  },
  ul({ children }) {
    return <ul className="list-disc space-y-1 pl-5 text-zinc-600">{children}</ul>
  },
  ol({ children }) {
    return <ol className="list-decimal space-y-1 pl-5 text-zinc-600">{children}</ol>
  },
  li({ children }) {
    return <li>{children}</li>
  },
  hr() {
    return <hr className="border-zinc-200" />
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-zinc-300 pl-4 italic text-zinc-600">
        {children}
      </blockquote>
    )
  },
  code({ className, children, ...props }) {
    return (
      <code
        {...props}
        className={cn(
          "rounded bg-zinc-200/80 px-1 py-0.5 font-mono text-[11px] text-zinc-700",
          className,
        )}
      >
        {children}
      </code>
    )
  },
  pre({ children }) {
    return (
      <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-100 p-3 font-mono text-xs leading-relaxed text-zinc-700">
        {children}
      </pre>
    )
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs text-zinc-700">
          {children}
        </table>
      </div>
    )
  },
  thead({ children }) {
    return <thead className="bg-zinc-100">{children}</thead>
  },
  tbody({ children }) {
    return <tbody>{children}</tbody>
  },
  tr({ children }) {
    return <tr className="border-b border-zinc-200 align-top">{children}</tr>
  },
  th({ children }) {
    return <th className="px-3 py-2 font-semibold text-zinc-900">{children}</th>
  },
  td({ children }) {
    return <td className="px-3 py-2">{children}</td>
  },
  img({ alt, src }) {
    if (!src) {
      return null
    }

    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 no-underline transition-colors hover:bg-zinc-100"
      >
        <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Imagem
        </span>
        <span className="min-w-0 space-y-0.5">
          <span className="block text-xs font-medium text-zinc-900">
            {alt?.trim() || "Abrir imagem"}
          </span>
          <span className="block truncate font-mono text-[11px] text-zinc-500">
            {src.replace(/^https?:\/\//, "")}
          </span>
        </span>
      </a>
    )
  },
} satisfies Components

interface MarkdownRendererProps {
  content: string
  className?: string
}

const MarkdownRendererComponent = memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn("space-y-2 text-sm leading-relaxed", className)}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "500px",
      }}
    >
      <ReactMarkdown
        skipHtml
        remarkPlugins={REMARK_PLUGINS}
        components={MARKDOWN_COMPONENTS}
        urlTransform={defaultUrlTransform}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

MarkdownRendererComponent.displayName = "MarkdownRenderer"

export { MarkdownRendererComponent as MarkdownRenderer }
