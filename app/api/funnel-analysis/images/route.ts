import { NextResponse } from "next/server"
import { getAuthenticatedUserFromRequest } from "@/lib/auth/session"

export const runtime = "nodejs"

// ---------------------------------------------------------------------------
// CRC-32 (necessário para o formato ZIP)
// ---------------------------------------------------------------------------

function buildCRC32Table(): Uint32Array {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  return table
}

const CRC32_TABLE = buildCRC32Table()

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const b of data) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ b) & 0xff]!
  }
  return (crc ^ 0xffffffff) >>> 0
}

// ---------------------------------------------------------------------------
// Builder ZIP (formato STORE — sem compressão, sem dependências externas)
// ---------------------------------------------------------------------------

function writeU16LE(buf: number[], v: number) {
  buf.push(v & 0xff, (v >> 8) & 0xff)
}

function writeU32LE(buf: number[], v: number) {
  buf.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff)
}

type ZipEntry = { filename: string; data: Uint8Array<ArrayBuffer> }

function buildZip(entries: ZipEntry[]): Uint8Array {
  const parts: Uint8Array[] = []
  const centralDir: number[] = []
  let offset = 0

  for (const { filename, data } of entries) {
    const name = new TextEncoder().encode(filename)
    const checksum = crc32(data)
    const size = data.length

    // Local File Header
    const local: number[] = []
    local.push(0x50, 0x4b, 0x03, 0x04) // signature
    writeU16LE(local, 20)               // version needed (2.0)
    writeU16LE(local, 0)                // general purpose flag
    writeU16LE(local, 0)                // compression: STORE
    writeU16LE(local, 0)                // mod time
    writeU16LE(local, 0)                // mod date
    writeU32LE(local, checksum)
    writeU32LE(local, size)             // compressed size
    writeU32LE(local, size)             // uncompressed size
    writeU16LE(local, name.length)
    writeU16LE(local, 0)                // extra field length
    local.push(...name)

    const localArr = new Uint8Array(local)
    const fileOffset = offset
    parts.push(localArr)
    parts.push(data)
    offset += localArr.length + size

    // Central Directory Entry
    centralDir.push(0x50, 0x4b, 0x01, 0x02) // signature
    writeU16LE(centralDir, 20)               // version made by
    writeU16LE(centralDir, 20)               // version needed
    writeU16LE(centralDir, 0)                // general purpose flag
    writeU16LE(centralDir, 0)                // compression: STORE
    writeU16LE(centralDir, 0)                // mod time
    writeU16LE(centralDir, 0)                // mod date
    writeU32LE(centralDir, checksum)
    writeU32LE(centralDir, size)             // compressed size
    writeU32LE(centralDir, size)             // uncompressed size
    writeU16LE(centralDir, name.length)
    writeU16LE(centralDir, 0)                // extra field length
    writeU16LE(centralDir, 0)                // file comment length
    writeU16LE(centralDir, 0)                // disk number start
    writeU16LE(centralDir, 0)                // internal attributes
    writeU32LE(centralDir, 0)                // external attributes
    writeU32LE(centralDir, fileOffset)       // offset of local header
    centralDir.push(...name)
  }

  const centralDirArr = new Uint8Array(centralDir)
  const centralDirOffset = offset

  // End of Central Directory Record
  const eocd: number[] = []
  eocd.push(0x50, 0x4b, 0x05, 0x06)          // signature
  writeU16LE(eocd, 0)                          // disk number
  writeU16LE(eocd, 0)                          // disk with central dir
  writeU16LE(eocd, entries.length)             // entries on this disk
  writeU16LE(eocd, entries.length)             // total entries
  writeU32LE(eocd, centralDirArr.length)       // central dir size
  writeU32LE(eocd, centralDirOffset)           // central dir offset
  writeU16LE(eocd, 0)                          // comment length

  parts.push(centralDirArr)
  parts.push(new Uint8Array(eocd))

  const total = parts.reduce((s, p) => s + p.length, 0)
  const result = new Uint8Array(total)
  let pos = 0
  for (const p of parts) {
    result.set(p, pos)
    pos += p.length
  }
  return result
}

// ---------------------------------------------------------------------------
// Helper: extrai extensão da URL de imagem
// ---------------------------------------------------------------------------

function guessExt(url: string): string {
  try {
    const path = new URL(url).pathname
    const m = path.match(/\.(\w{2,5})$/)
    if (m) return m[1]!.toLowerCase()
  } catch {
    // ignora
  }
  return "jpg"
}

// ---------------------------------------------------------------------------
// GET  /api/funnel-analysis/images?url=<url>
// Proxy individual — faz download servidor → cliente com headers de download
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url") ?? ""

  // Valida a URL
  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 })
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Protocolo não suportado." }, { status: 400 })
  }

  let imageResponse: Response
  try {
    imageResponse = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BugSpy/1.0)" },
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return NextResponse.json({ error: "Falha ao buscar imagem." }, { status: 502 })
  }

  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: `Imagem retornou HTTP ${imageResponse.status}` },
      { status: 502 },
    )
  }

  const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg"
  const data = await imageResponse.arrayBuffer()
  const ext = guessExt(imageUrl)
  const filename = `imagem.${ext}`

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}

// ---------------------------------------------------------------------------
// POST /api/funnel-analysis/images
// Body: { urls: string[], baseName?: string }
// Baixa todas as imagens e retorna um arquivo ZIP
// ---------------------------------------------------------------------------

const MAX_IMAGES_ZIP = 60

export async function POST(request: Request) {
  const user = await getAuthenticatedUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  const { urls, baseName } = payload as { urls?: unknown; baseName?: unknown }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "Campo 'urls' é obrigatório." }, { status: 400 })
  }

  const validUrls = (urls as string[])
    .filter((u) => {
      try {
        const p = new URL(u)
        return p.protocol === "http:" || p.protocol === "https:"
      } catch {
        return false
      }
    })
    .slice(0, MAX_IMAGES_ZIP)

  if (validUrls.length === 0) {
    return NextResponse.json({ error: "Nenhuma URL válida fornecida." }, { status: 400 })
  }

  // Baixa todas as imagens em paralelo (com fallback individual)
  const results = await Promise.allSettled(
    validUrls.map(async (url) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BugSpy/1.0)" },
        signal: AbortSignal.timeout(15_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      return { url, data: buf }
    }),
  )

  const entries: ZipEntry[] = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]!
    if (r.status === "fulfilled") {
      const ext = guessExt(r.value.url)
      entries.push({
        filename: `imagem-${String(i + 1).padStart(3, "0")}.${ext}`,
        data: new Uint8Array(r.value.data) as Uint8Array<ArrayBuffer>,
      })
    }
  }

  if (entries.length === 0) {
    return NextResponse.json({ error: "Nenhuma imagem pôde ser baixada." }, { status: 502 })
  }

  const zipData = buildZip(entries)
  const safeBase = typeof baseName === "string" ? baseName.replace(/[^a-z0-9-]/gi, "_").slice(0, 40) : "imagens"

  return new Response(zipData.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeBase}-imagens.zip"`,
      "Cache-Control": "no-store",
    },
  })
}
