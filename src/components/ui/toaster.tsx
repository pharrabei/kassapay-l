"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  useToastStore,
  type ToastItem,
  type ToastVariant,
} from "@/store/toast-store"

const variantStyles: Record<
  ToastVariant,
  { shell: string; icon: typeof CheckmarkCircle02Icon }
> = {
  default: {
    shell: "border-border bg-background text-foreground",
    icon: InformationCircleIcon,
  },
  success: {
    shell: "border-primary/25 bg-background text-foreground",
    icon: CheckmarkCircle02Icon,
  },
  error: {
    shell: "border-destructive/30 bg-background text-foreground",
    icon: Alert02Icon,
  },
  info: {
    shell: "border-border bg-background text-foreground",
    icon: InformationCircleIcon,
  },
}

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss)
  const styles = variantStyles[item.variant]

  React.useEffect(() => {
    if (item.duration <= 0) return
    const timer = window.setTimeout(() => dismiss(item.id), item.duration)
    return () => window.clearTimeout(timer)
  }, [dismiss, item.duration, item.id])

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3.5 shadow-lg animate-in fade-in zoom-in-95 duration-200",
        styles.shell
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          item.variant === "success" && "bg-primary/10 text-primary",
          item.variant === "error" && "bg-destructive/10 text-destructive",
          (item.variant === "default" || item.variant === "info") &&
            "bg-muted text-muted-foreground"
        )}
      >
        <HugeiconsIcon icon={styles.icon} size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Закрыть"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[300] flex flex-col items-center gap-2 px-4 sm:top-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  )
}
