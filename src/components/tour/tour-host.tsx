"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Coachmark } from "@/components/tour/coachmark"
import { getDashboardCopy } from "@/lib/dashboard-i18n"
import {
  buildGuideSteps,
  consumeTourLanding,
  getTourStage,
  isTourComplete,
  requestSidebarOpen,
  stashTourLanding,
  t,
  tourNavTarget,
  TOUR_STAGES,
  TOUR_WELCOME,
  type TourStageId,
} from "@/lib/tour-config"
import { withBasePath } from "@/lib/base-path"
import { navigateHard, normalizeAppPath } from "@/lib/routing"
import { tourDelay, TOUR_TIMING } from "@/lib/tour-timing"
import { useLanguageStore } from "@/store/language-store"
import { useTourStore } from "@/store/tour-store"

function stripLocale(pathname: string) {
  return normalizeAppPath(
    pathname.replace(/^\/(ru|kk|en)(?=\/|$)/, "") || "/"
  )
}

function stageFromPath(pathname: string): TourStageId | null {
  const path = stripLocale(pathname)
  const stage = TOUR_STAGES.find(
    (item) => path === item.route || path.startsWith(`${item.route}/`)
  )
  return stage?.id ?? null
}

export function TourHost() {
  const language = useLanguageStore((state) => state.language)
  const pathname = usePathname()
  const onboardingCopy = getDashboardCopy(language).onboarding
  const welcomeSeen = useTourStore((state) => state.welcomeSeen)
  const active = useTourStore((state) => state.active)
  const uiMode = useTourStore((state) => state.uiMode)
  const currentStage = useTourStore((state) => state.currentStage)
  const guideIndex = useTourStore((state) => state.guideIndex)
  const navigatePhase = useTourStore((state) => state.navigatePhase)
  const completedStages = useTourStore((state) => state.completedStages)
  const openWelcome = useTourStore((state) => state.openWelcome)
  const startTourFromWelcome = useTourStore(
    (state) => state.startTourFromWelcome
  )
  const openStageIntro = useTourStore((state) => state.openStageIntro)
  const continueStageIntro = useTourStore((state) => state.continueStageIntro)
  const setNavigatePhase = useTourStore((state) => state.setNavigatePhase)
  const reconcileAfterHydration = useTourStore(
    (state) => state.reconcileAfterHydration
  )
  const [hydrated, setHydrated] = React.useState(false)
  const [coachmarkReady, setCoachmarkReady] = React.useState(false)

  React.useEffect(() => {
    function finishHydrate() {
      reconcileAfterHydration()
      setHydrated(true)
    }
    if (useTourStore.persist.hasHydrated()) {
      finishHydrate()
      return
    }
    const unsub = useTourStore.persist.onFinishHydration(() => finishHydrate())
    const timeout = window.setTimeout(() => finishHydrate(), 400)
    return () => {
      unsub?.()
      window.clearTimeout(timeout)
    }
  }, [reconcileAfterHydration])

  // Welcome only on dashboard home, first time.
  React.useEffect(() => {
    if (!hydrated) return
    if (isTourComplete(completedStages)) return
    if (welcomeSeen) return
    if (uiMode !== "idle" && uiMode !== "welcome") return
    if (stripLocale(pathname) !== "/dashboard") return
    openWelcome()
  }, [
    hydrated,
    completedStages,
    welcomeSeen,
    uiMode,
    pathname,
    openWelcome,
  ])

  // Directory page ↔ tour stage binding (never sticky after refresh alone).
  React.useEffect(() => {
    if (!hydrated) return
    if (isTourComplete(completedStages)) return
    if (!welcomeSeen) return
    if (uiMode === "welcome") return

    const pathStage = stageFromPath(pathname)
    if (!pathStage) return
    if (completedStages.includes(pathStage)) return

    // One-shot hard-nav resume (static export loses in-memory tour UI).
    const landed = consumeTourLanding(pathStage)
    if (landed) {
      openStageIntro(pathStage)
      return
    }

    // User opened the target directory from the menu (soft nav keeps memory).
    if (uiMode === "navigate" && pathStage === currentStage) {
      openStageIntro(pathStage)
      return
    }

    // Already guiding this page.
    if (
      (uiMode === "stage-intro" || uiMode === "coachmark") &&
      currentStage === pathStage
    ) {
      return
    }

    // Opened a different incomplete directory while menu-navigate was active:
    // follow the user — never leave a ghost tip on the previous item.
    if (uiMode === "navigate" && pathStage !== currentStage) {
      openStageIntro(pathStage)
      return
    }

    // Soft client nav while already active on another stage page.
    if (
      active &&
      (uiMode === "stage-intro" || uiMode === "coachmark") &&
      currentStage &&
      currentStage !== pathStage
    ) {
      openStageIntro(pathStage)
    }
  }, [
    hydrated,
    active,
    uiMode,
    pathname,
    currentStage,
    completedStages,
    welcomeSeen,
    openStageIntro,
  ])

  const stage = getTourStage(currentStage)
  const guideSteps = React.useMemo(
    () => (stage ? buildGuideSteps(stage) : []),
    [stage]
  )
  const currentGuide = guideSteps[guideIndex] ?? null

  React.useEffect(() => {
    if (uiMode === "coachmark" && active) {
      const timer = window.setTimeout(
        () => setCoachmarkReady(true),
        tourDelay(TOUR_TIMING.afterModalMs)
      )
      return () => window.clearTimeout(timer)
    }
    setCoachmarkReady(false)
  }, [uiMode, active, currentStage])

  // Navigate: open directories panel for item phase; advance section → item on rail click.
  React.useEffect(() => {
    if (uiMode !== "navigate" || !active) return
    // Already on a directory page → intro takes over; do not fight menu close.
    if (stageFromPath(pathname)) return

    if (navigatePhase === "section") {
      const el = document.querySelector<HTMLElement>(
        `[data-tour="tour-nav-section-directories"]`
      )
      if (!el) return
      const onClick = () => {
        window.setTimeout(() => setNavigatePhase("item"), 180)
      }
      el.addEventListener("click", onClick)
      return () => el.removeEventListener("click", onClick)
    }

    // Item phase: open panel once so the target link exists (no spam timers).
    requestSidebarOpen("directories")
  }, [uiMode, navigatePhase, active, currentStage, pathname, setNavigatePhase])

  function handleStart() {
    const stageId = startTourFromWelcome()
    if (!stageId) return
    const next = getTourStage(stageId)
    if (!next) return
    stashTourLanding(stageId)
    window.setTimeout(
      () => navigateHard(next.route),
      tourDelay(TOUR_TIMING.afterWelcomeStartMs)
    )
  }

  function handleContinueIntro() {
    window.setTimeout(() => continueStageIntro(), tourDelay(160))
  }

  const showWelcome = hydrated && uiMode === "welcome"
  const showStageIntro =
    hydrated && uiMode === "stage-intro" && stage && active
  const pathStage = stageFromPath(pathname)
  const showPageCoachmark =
    hydrated &&
    coachmarkReady &&
    uiMode === "coachmark" &&
    active &&
    stage &&
    currentGuide &&
    pathStage === stage.id

  const showMenuCoachmark =
    hydrated &&
    uiMode === "navigate" &&
    active &&
    Boolean(currentStage) &&
    // Hide menu tip once user is already on the target page (intro will take over).
    pathStage !== currentStage

  const menuTarget =
    navigatePhase === "section"
      ? "tour-nav-section-directories"
      : currentStage
        ? tourNavTarget(currentStage)
        : ""

  const menuHint =
    navigatePhase === "section"
      ? t(TOUR_WELCOME.openDirectories, language)
      : stage
        ? t(stage.menuClickHint, language)
        : t(TOUR_WELCOME.nextStage, language)

  return (
    <>
      <Dialog open={showWelcome} onOpenChange={() => {}}>
        <DialogContent
          className="flex max-h-[min(92dvh,860px)] w-[min(calc(100dvw-2rem),980px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none data-open:duration-300 data-closed:duration-200"
          showCloseButton={false}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {onboardingCopy.introTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {onboardingCopy.introDescription}
          </DialogDescription>

          <div className="grid min-h-[min(70dvh,480px)] animate-in gap-8 px-8 py-10 duration-500 fade-in slide-in-from-bottom-2 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-12 lg:px-12 lg:py-14">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {onboardingCopy.introEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {onboardingCopy.introTitle}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {onboardingCopy.introDescription}
              </p>

              <div className="mt-10">
                <Button
                  type="button"
                  className="h-12 min-w-52 px-7 text-sm"
                  onClick={handleStart}
                >
                  {onboardingCopy.introStart}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Button>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[300px] w-full max-w-[300px] lg:block">
              <div className="absolute inset-x-6 top-10 h-32 rounded-full bg-primary/10 blur-3xl" />
              <Image
                src={withBasePath("/Rocket.png")}
                alt=""
                width={420}
                height={420}
                className="relative mx-auto h-full w-auto object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(showStageIntro)} onOpenChange={() => {}}>
        <DialogContent
          className="flex max-h-[min(92dvh,720px)] w-[min(calc(100dvw-2rem),560px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none data-open:duration-300 data-closed:duration-200"
          showCloseButton={false}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          {stage ? (
            <div
              key={stage.id}
              className="animate-in duration-500 fade-in slide-in-from-bottom-2"
            >
              <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-primary/20 via-primary/8 to-muted sm:h-56">
                <Image
                  src={withBasePath(stage.image)}
                  alt=""
                  width={280}
                  height={220}
                  className="h-40 w-auto object-contain drop-shadow-sm sm:h-44"
                  priority
                />
              </div>
              <div className="space-y-6 px-8 py-8 sm:px-10 sm:py-9">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {t(stage.title, language)}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground sm:text-[15px]">
                    {t(stage.description, language)}
                  </p>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    className="h-11 min-w-36 px-6"
                    onClick={handleContinueIntro}
                  >
                    {t(TOUR_WELCOME.continue, language)}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {showPageCoachmark && currentGuide ? (
        <Coachmark
          target={currentGuide.target}
          text={t(currentGuide.text, language)}
          mode={currentGuide.kind === "field" ? "field" : "spotlight"}
          preferSide={
            currentGuide.kind === "field"
              ? "top"
              : currentGuide.kind === "add"
                ? "bottom"
                : currentGuide.kind === "save"
                  ? "top"
                  : "auto"
          }
          refreshKey={`${stage?.id}-${guideIndex}-${currentGuide.target}-${currentGuide.kind}`}
        />
      ) : null}

      {showMenuCoachmark && menuTarget ? (
        <Coachmark
          target={menuTarget}
          text={menuHint}
          mode="tip"
          preferSide="right"
          refreshKey={`nav-${currentStage}-${navigatePhase}`}
          hideWhenMissing
        />
      ) : null}
    </>
  )
}
