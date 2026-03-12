import { cn } from "@/lib/utils"

type SpinnerSize = "sm" | "md" | "lg"

const sizeMap: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
}

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

function LoadingSpinner({
  size = "md",
  className,
  label = "Carregando...",
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-current border-r-transparent animate-spin",
        "text-[oklch(0.60_0.20_264)]",
        sizeMap[size],
        className,
      )}
    />
  )
}

export { LoadingSpinner }
export type { SpinnerSize }
