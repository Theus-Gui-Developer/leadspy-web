"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type ShareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl: string | null
}

export function ShareDialog({ open, onOpenChange, shareUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copiado!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Erro ao copiar link.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setCopied(false)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar anúncio</DialogTitle>
          <DialogDescription>
            Qualquer pessoa com este link poderá visualizar o anúncio e salvá-lo na própria conta.
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="flex items-center gap-2 py-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-xs"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 gap-1.5"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                size={14}
                className={copied ? "text-emerald-400" : ""}
              />
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Não foi possível gerar o link de compartilhamento.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
