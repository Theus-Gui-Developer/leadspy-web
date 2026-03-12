import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading_spinner"

type LoadingStateProps = {
  message?: string
  fullscreen?: boolean
  className?: string
}

export function LoadingState({
  message = "Carregando...",
  fullscreen = false,
  className,
}: LoadingStateProps) {
  if (fullscreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4",
          "bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        <LoadingSpinner size="lg" label={message} />
        <p className="animate-pulse text-sm text-muted-foreground">{message}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className
      )}
    >
      <LoadingSpinner size="lg" label={message} />
      <p className="animate-pulse text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
