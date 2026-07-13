import * as React from "react"
import { cn } from "@/lib/utils"

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1.5 text-center">
        <p className="w-full text-center text-sm font-semibold text-foreground">
          {title}
        </p>
        {description ? (
          <p className="w-full text-center text-sm leading-6 whitespace-normal text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="mt-1 flex w-full justify-center">{action}</div>
      ) : null}
    </div>
  )
}

export { EmptyState }
