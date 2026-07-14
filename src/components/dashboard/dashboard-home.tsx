"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardCopy } from "@/lib/dashboard-i18n"
import {
  getTourStage,
  isTourComplete,
  stashTourLanding,
  t,
  TOUR_STAGES,
  TOUR_WELCOME,
} from "@/lib/tour-config"
import { navigateHard } from "@/lib/routing"
import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/store/language-store"
import {
  useDirectoriesStore,
} from "@/store/directories-store"
import { useTourStore } from "@/store/tour-store"

export function DashboardHome() {
  const language = useLanguageStore((state) => state.language)
  const copy = getDashboardCopy(language)
  const completedStages = useTourStore((state) => state.completedStages)
  const resumeTour = useTourStore((state) => state.resumeTour)
  const openWelcome = useTourStore((state) => state.openWelcome)
  const welcomeSeen = useTourStore((state) => state.welcomeSeen)
  const contractors = useDirectoriesStore((state) => state.contractors)
  const objects = useDirectoriesStore((state) => state.objects)
  const [hasHydrated, setHasHydrated] = React.useState(false)

  const complete = isTourComplete(completedStages)
  const progress = Math.round(
    (completedStages.length / Math.max(TOUR_STAGES.length, 1)) * 100
  )

  React.useEffect(() => {
    if (useTourStore.persist.hasHydrated()) {
      setHasHydrated(true)
      return
    }
    const unsub = useTourStore.persist.onFinishHydration(() =>
      setHasHydrated(true)
    )
    const timeout = window.setTimeout(() => setHasHydrated(true), 400)
    return () => {
      unsub?.()
      window.clearTimeout(timeout)
    }
  }, [])

  function handleResume() {
    if (!welcomeSeen && !complete) {
      openWelcome()
      return
    }
    const stageId = resumeTour()
    const stage = getTourStage(stageId)
    if (!stage || !stageId) return
    // Hard nav wipes memory — stash one-shot landing for TourHost.
    stashTourLanding(stageId)
    navigateHard(stage.route)
  }

  if (!hasHydrated) {
    return (
      <main className="min-h-full bg-background">
        <div className="w-full px-4 py-6 sm:px-5 lg:px-6 2xl:px-8">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg border border-border bg-background p-6">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-9 w-64" />
              <Skeleton className="mt-3 h-4 w-full max-w-xl" />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-8 w-16" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                ))}
              </div>
            </div>
            <aside className="rounded-lg border border-border bg-muted/20 p-5">
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="mt-4 h-6 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-5 h-2 w-full rounded-full" />
              <Skeleton className="mt-5 h-11 w-full rounded-lg" />
            </aside>
          </section>
        </div>
      </main>
    )
  }

  const cards = [
    {
      label: copy.home.cards[0]?.label ?? "Контрагенты",
      value: String(contractors.length),
      hint: copy.home.cards[0]?.hint ?? "",
    },
    {
      label: copy.home.cards[1]?.label ?? "Объекты",
      value: String(objects.length),
      hint: copy.home.cards[1]?.hint ?? "",
    },
    {
      label: copy.home.cards[2]?.label ?? "Продажи",
      value: copy.home.cards[2]?.value ?? "0 ₸",
      hint: copy.home.cards[2]?.hint ?? "",
    },
  ]

  return (
    <main className="min-h-full bg-background">
      <div className="w-full animate-in px-4 py-6 duration-300 fade-in sm:px-5 lg:px-6 2xl:px-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.home.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {copy.home.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.home.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4"
                >
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium text-foreground">
                {t(TOUR_WELCOME.progressLabel, language)}
              </p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {TOUR_STAGES.map((stage, index) => {
                  const done = completedStages.includes(stage.id)
                  return (
                    <li
                      key={stage.id}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
                        done
                          ? "border-primary/20 bg-primary/[0.06] text-foreground"
                          : "border-border bg-muted/20 text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                          done
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? (
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            size={14}
                            strokeWidth={2}
                          />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="truncate font-medium">
                        {t(stage.title, language)}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-muted/25 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <HugeiconsIcon icon={Rocket01Icon} size={20} strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {copy.home.setupTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {complete
                ? t(TOUR_WELCOME.completedDescription, language)
                : copy.home.setupDescription}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{copy.home.progress}</span>
                <span className="tabular-nums font-medium text-foreground">
                  {progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Button
              type="button"
              className="mt-5 h-11 w-full"
              onClick={handleResume}
            >
              {complete
                ? t(TOUR_WELCOME.completedTitle, language)
                : welcomeSeen
                  ? t(TOUR_WELCOME.resume, language)
                  : t(TOUR_WELCOME.start, language)}
              {!complete ? (
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
              ) : null}
            </Button>
          </aside>
        </section>
      </div>
    </main>
  )
}
