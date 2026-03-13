"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderLibraryIcon,
  Add01Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Tick02Icon,
  Cancel01Icon,
  FolderOpenIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SavedAdFolder, FolderFilterId } from "@/components/saved-ads/types"
import { NO_FOLDER } from "@/components/saved-ads/types"

type FolderSidebarProps = {
  folders: SavedAdFolder[]
  noFolderCount: number
  totalCount: number
  selectedFolderId: FolderFilterId
  onSelectFolder: (folderId: FolderFilterId) => void
  onCreateFolder: (name: string) => Promise<boolean>
  onRenameFolder: (folderId: string, name: string) => Promise<boolean>
  onDeleteFolder: (folderId: string) => void
}

export function FolderSidebar({
  folders,
  noFolderCount,
  totalCount,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateSubmit() {
    if (!newFolderName.trim() || isSubmitting) return
    setIsSubmitting(true)
    const ok = await onCreateFolder(newFolderName.trim())
    setIsSubmitting(false)

    if (ok) {
      setNewFolderName("")
      setIsCreating(false)
    }
  }

  async function handleRenameSubmit(folderId: string) {
    if (!editingName.trim() || isSubmitting) return
    setIsSubmitting(true)
    const ok = await onRenameFolder(folderId, editingName.trim())
    setIsSubmitting(false)

    if (ok) {
      setEditingId(null)
      setEditingName("")
    }
  }

  function startEditing(folder: SavedAdFolder) {
    setEditingId(folder.id)
    setEditingName(folder.name)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName("")
  }

  function cancelCreating() {
    setIsCreating(false)
    setNewFolderName("")
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pastas
        </p>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} size={14} />
        </Button>
      </div>

      {/* Criar nova pasta */}
      {isCreating && (
            <div className="flex items-center gap-1 rounded-md bg-accent/30 px-2 py-1.5">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSubmit()
              if (e.key === "Escape") cancelCreating()
            }}
            placeholder="Nome da pasta"
            className="h-7 border-none bg-transparent px-1 text-xs"
            autoFocus
            disabled={isSubmitting}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCreateSubmit}
            disabled={isSubmitting || !newFolderName.trim()}
          >
            <HugeiconsIcon icon={Tick02Icon} size={12} className="text-emerald-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={cancelCreating}
            disabled={isSubmitting}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} className="text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Todos os anúncios */}
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-all",
          selectedFolderId === null
            ? "bg-primary/10 font-medium text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <HugeiconsIcon
          icon={FolderLibraryIcon}
          size={16}
          className={cn(
            "shrink-0",
            selectedFolderId === null ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className="flex-1 truncate">Todos</span>
        <span className="text-xs tabular-nums text-muted-foreground">{totalCount}</span>
      </button>

      {/* Sem pasta */}
      <button
        type="button"
        onClick={() => onSelectFolder(NO_FOLDER)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-all",
          selectedFolderId === NO_FOLDER
            ? "bg-primary/10 font-medium text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <HugeiconsIcon
          icon={FolderOpenIcon}
          size={16}
          className={cn(
            "shrink-0",
            selectedFolderId === NO_FOLDER ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className="flex-1 truncate">Sem pasta</span>
        <span className="text-xs tabular-nums text-muted-foreground">{noFolderCount}</span>
      </button>

      {/* Separador */}
      {folders.length > 0 && <div className="mx-2 my-1.5 h-px bg-border/50" />}

      {/* Pastas do usuário */}
      {folders.map((folder) => (
        <div key={folder.id} className="group relative">
          {editingId === folder.id ? (
        <div className="flex items-center gap-1 rounded-md bg-accent/30 px-2 py-1.5">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(folder.id)
                  if (e.key === "Escape") cancelEditing()
                }}
                className="h-7 border-none bg-transparent px-1 text-xs"
                autoFocus
                disabled={isSubmitting}
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRenameSubmit(folder.id)}
                disabled={isSubmitting || !editingName.trim()}
              >
                <HugeiconsIcon icon={Tick02Icon} size={12} className="text-emerald-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={cancelEditing}
                disabled={isSubmitting}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} className="text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-all",
                  selectedFolderId === folder.id
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <HugeiconsIcon
                  icon={FolderLibraryIcon}
                  size={16}
                  className={cn(
                    "shrink-0",
                    selectedFolderId === folder.id ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {folder.adCount}
                </span>
                {/* Espaço reservado para o botão de ações sobreposto */}
                <span className="ml-1 size-5 shrink-0" aria-hidden />
              </button>

              {/* Ações da pasta (absoluto — evita <button> aninhado) */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={MoreVerticalIcon} size={12} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4}>
                    <DropdownMenuItem onClick={() => startEditing(folder)}>
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} className="mr-2" />
                      Renomear
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteFolder(folder.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
