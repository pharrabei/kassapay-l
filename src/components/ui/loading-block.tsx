import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

function LoadingBlock({
  label = "Загрузка...",
  fullScreen = false,
  className,
}: {
  label?: string
  fullScreen?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          : "flex min-h-40 items-center justify-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <Spinner size="sm" label="" />
        <span>{label}</span>
      </div>
    </div>
  )
}

function PageLoader({ label = "Загрузка..." }: { label?: string }) {
  return (
    <div
      className="flex min-h-[50dvh] w-full flex-col items-center justify-center gap-3 px-4 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" label="" />
      <p className="text-center text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export { LoadingBlock, PageLoader }
