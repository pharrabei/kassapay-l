"use client"

import { cn } from "@/lib/utils"
import { BrandLoader } from "@/components/ui/brand-loader"
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
  if (fullScreen) {
    return <BrandLoader fullScreen label={label} className={className} />
  }

  return (
    <div
      className={cn(
        "flex min-h-40 items-center justify-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <Spinner size="sm" label="" className="text-primary" />
        <span>{label}</span>
      </div>
    </div>
  )
}

function PageLoader({ label = "Загрузка..." }: { label?: string }) {
  return <BrandLoader label={label} />
}

export { LoadingBlock, PageLoader }
