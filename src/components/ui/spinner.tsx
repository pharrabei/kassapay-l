import { cn } from "@/lib/utils"

const sizeMap = {
  xs: "size-3 border",
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-[3px]",
} as const

export type SpinnerSize = keyof typeof sizeMap

function Spinner({
  className,
  size = "sm",
  label = "Загрузка",
}: {
  className?: string
  size?: SpinnerSize
  /** Accessible label; pass empty string to hide from AT. */
  label?: string
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        aria-hidden
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent opacity-90",
          sizeMap[size]
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}

export { Spinner }
