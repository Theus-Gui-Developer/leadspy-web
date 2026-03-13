"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderLibraryIcon,
  FolderOpenIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { SavedAdFolder } from "@/components/saved-ads/types"

type MoveToFolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: SavedAdFolder[]
  currentFolderId: string | null
  onMove: (folderId: string | null) => void
}

export function MoveToFolderDialog({
  open,
  onOpenChange,
  folders,
  currentFolderId,
  onMove,
}: MoveToFolderDialogProps) {
  function handleSelect(folderId: string | null) {
    onMove(folderId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover para pasta</DialogTitle>
          <DialogDescription>
            Selecione a pasta de destino para este anúncio.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-64 space-y-1 overflow-y-auto py-2">
          {/* Sem pasta */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
              currentFolderId === null
                ? "bg-primary/10 font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <HugeiconsIcon icon={FolderOpenIcon} size={16} className="shrink-0" />
            <span className="flex-1">Sem pasta</span>
            {currentFolderId === null && (
              <HugeiconsIcon icon={Tick02Icon} size={14} className="text-primary" />
            )}
          </button>

          {/* Pastas */}
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => handleSelect(folder.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                currentFolderId === folder.id
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <HugeiconsIcon icon={FolderLibraryIcon} size={16} className="shrink-0" />
              <span className="flex-1 truncate">{folder.name}</span>
              {currentFolderId === folder.id && (
                <HugeiconsIcon icon={Tick02Icon} size={14} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
