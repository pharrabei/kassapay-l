"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons"
import {
  getTourStage,
  requestSidebarOpen,
  t,
  tourNavTarget,
  type TourStageId,
} from "@/lib/tour-config"
import { useLanguageStore } from "@/store/language-store"
import { cn } from "@/lib/utils"

interface TourNavigateHintProps {
  nextStageId: TourStageId
}

const copy = {
  title: {
    ru: "Этап сохранён — откройте следующий справочник",
    kk: "Кезең сақталды — келесі анықтамалықты ашыңыз",
  },
  bodyBefore: {
    ru: "В боковом меню слева выберите",
    kk: "Сол жақтағы мәзірден таңдаңыз",
  },
  bodyAfter: {
    ru: "Нажмите на него в боковом меню.",
    kk: "Сол жақтағы мәзірден оны басыңыз.",
  },
  openMenu: {
    ru: "Открыть меню",
    kk: "Мәзірді ашу",
  },
} as const

/**
 * Post-save guidance: user must open the next directory via the sidebar.
 * No full-screen coachmark — the menu stays free to click.
 */
export function TourNavigateHint({ nextStageId }: TourNavigateHintProps) {
  const language = useLanguageStore((state) => state.language)
  const stage = getTourStage(nextStageId)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    // Open directories panel so the user can click the next item.
    // No fill/highlight on items — coachmark tip + arrow is enough (readable labels).
    requestSidebarOpen("directories")
    const openT = window.setTimeout(
      () => requestSidebarOpen("directories"),
      120
    )
    const scrollT = window.setTimeout(() => {
      const item = document.querySelector<HTMLElement>(
        `[data-tour="${tourNavTarget(nextStageId)}"]`
      )
      item?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, 350)

    return () => {
      window.clearTimeout(openT)
      window.clearTimeout(scrollT)
    }
  }, [nextStageId])

  if (!mounted || !stage) return null

  const stageTitle = t(stage.title, language)

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex justify-center p-4 sm:p-5",
        // Keep clear of icon rail; banner is in the content zone
        "pl-[4.5rem]"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-lg flex-col gap-3 rounded-2xl",
          "border border-primary/25 bg-popover p-4 shadow-2xl",
          "sm:flex-row sm:items-center sm:gap-4"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <HugeiconsIcon icon={SidebarLeftIcon} size={18} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {t(copy.title, language)}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-[13px]">
            {t(copy.bodyBefore, language)}{" "}
            <span className="font-semibold text-primary">{stageTitle}</span>
            . {t(copy.bodyAfter, language)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => requestSidebarOpen("directories")}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl",
            "bg-primary px-3.5 text-sm font-medium text-primary-foreground",
            "transition-colors hover:bg-primary/90"
          )}
        >
          {t(copy.openMenu, language)}
          <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
        </button>
      </div>
    </div>,
    document.body
  )
}
