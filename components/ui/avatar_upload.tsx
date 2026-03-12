"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type AvatarUploadProps = {
  userId: string
  name: string
  /** Tamanho do avatar em pixels (padrão 80) */
  size?: number
  className?: string
}

const STORAGE_KEY_PREFIX = "leadspy_avatar_"
const MAX_FILE_SIZE_MB = 2
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

export function useAvatarStorage(userId: string) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(userId))
      if (stored) setAvatarUrl(stored)
    } catch {
      // localStorage indisponível (SSR ou privacidade)
    }
  }, [userId])

  const saveAvatar = useCallback(
    (dataUrl: string) => {
      try {
        localStorage.setItem(storageKey(userId), dataUrl)
        setAvatarUrl(dataUrl)
      } catch {
        // quota excedida ou bloqueado
      }
    },
    [userId],
  )

  const removeAvatar = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(userId))
      setAvatarUrl(null)
    } catch {
      // silencioso
    }
  }, [userId])

  return { avatarUrl, saveAvatar, removeAvatar }
}

export function AvatarUpload({ userId, name, size = 80, className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { avatarUrl, saveAvatar, removeAvatar } = useAvatarStorage(userId)

  const initials = getInitials(name)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato inválido. Use JPG, PNG, WebP ou GIF.")
      e.target.value = ""
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Imagem muito grande. Máximo ${MAX_FILE_SIZE_MB}MB.`)
      e.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) saveAvatar(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Área clicável do avatar */}
      <div
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Alterar foto de perfil"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
      >
        {/* Avatar base */}
        <div
          className="flex size-full items-center justify-center overflow-hidden rounded-full ring-2 ring-[#3c83f6]/20 transition-all duration-200"
          style={{
            background: avatarUrl
              ? "transparent"
              : "linear-gradient(135deg, oklch(0.60 0.20 264 / 30%), oklch(0.60 0.20 264 / 10%))",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span
              className="select-none font-semibold text-[#3c83f6]"
              style={{ fontSize: size * 0.3 }}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Overlay de hover */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity duration-150",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <HugeiconsIcon icon={Camera01Icon} size={size * 0.28} className="text-white" />
        </div>

        {/* Indicador online */}
        <span
          className="absolute right-0.5 bottom-0.5 rounded-full border-2 border-background bg-emerald-500"
          style={{ width: size * 0.15, height: size * 0.15 }}
        />
      </div>

      {/* Botão remover — só aparece se houver foto */}
      {avatarUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            removeAvatar()
          }}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          <HugeiconsIcon icon={Delete01Icon} size={11} />
          Remover foto
        </button>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="max-w-[160px] text-center text-xs text-destructive">{error}</p>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />
    </div>
  )
}
