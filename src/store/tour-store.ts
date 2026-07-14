"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  getFirstIncompleteStage,
  getNextStageId,
  isTourComplete,
  TOUR_STAGE_IDS,
  type TourStageId,
} from "@/lib/tour-config"

export type TourUiMode =
  | "idle"
  | "welcome"
  | "stage-intro"
  | "coachmark"
  /** Guide user to open next directory via sidebar (session-only, not persisted). */
  | "navigate"
  | "finished"

/** Within navigate: first icon rail, then concrete directory item. */
export type NavigatePhase = "section" | "item"

/** Only durable progress — never stuck UI modes after refresh. */
export interface TourPersistedSlice {
  welcomeSeen: boolean
  completedStages: TourStageId[]
}

interface TourState extends TourPersistedSlice {
  /** Tour is actively guiding the user (ephemeral). */
  active: boolean
  currentStage: TourStageId | null
  uiMode: TourUiMode
  /** Index inside stage guide (add → fields → save). */
  guideIndex: number
  navigatePhase: NavigatePhase

  setWelcomeSeen: (seen: boolean) => void
  openWelcome: () => void
  /** Welcome CTA: start first incomplete stage (caller navigates). */
  startTourFromWelcome: () => TourStageId | null
  postponeWelcome: () => void
  /** Landed on stage page — show intro modal. */
  openStageIntro: (stage: TourStageId) => void
  continueStageIntro: () => void
  setGuideIndex: (index: number) => void
  advanceGuide: () => void
  setNavigatePhase: (phase: NavigatePhase) => void
  /** Successful create on current stage directory. */
  completeCurrentStage: () => {
    completedStage: TourStageId
    nextStage: TourStageId | null
    finished: boolean
  } | null
  /** Pause tips without wiping progress (Escape / «Позже»). */
  dismissTourUi: () => void
  /** Skip current incomplete stage and advance progress. */
  skipCurrentStage: () => TourStageId | null
  resumeTour: () => TourStageId | null
  markStageComplete: (stage: TourStageId) => void
  /** After soft/hard landing — rebuild safe runtime from path + progress. */
  reconcileAfterHydration: () => void
  resetTour: () => void
}

function normalizeCompleted(ids: unknown): TourStageId[] {
  if (!Array.isArray(ids)) return []
  const set = new Set(
    ids.filter((id): id is TourStageId =>
      TOUR_STAGE_IDS.includes(id as TourStageId)
    )
  )
  return TOUR_STAGE_IDS.filter((id) => set.has(id))
}

const ephemeralDefaults = {
  active: false,
  currentStage: null as TourStageId | null,
  uiMode: "idle" as TourUiMode,
  guideIndex: 0,
  navigatePhase: "section" as NavigatePhase,
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      welcomeSeen: false,
      completedStages: [],
      ...ephemeralDefaults,

      setWelcomeSeen: (seen) => set({ welcomeSeen: seen }),

      openWelcome: () => {
        if (isTourComplete(get().completedStages)) {
          set({
            ...ephemeralDefaults,
            uiMode: "finished",
            welcomeSeen: true,
          })
          return
        }
        set({
          uiMode: "welcome",
          active: true,
          guideIndex: 0,
          currentStage: null,
          navigatePhase: "section",
        })
      },

      startTourFromWelcome: () => {
        const completed = get().completedStages
        if (isTourComplete(completed)) {
          set({
            welcomeSeen: true,
            ...ephemeralDefaults,
            uiMode: "finished",
          })
          return null
        }
        const stage = getFirstIncompleteStage(completed) ?? TOUR_STAGE_IDS[0]
        set({
          welcomeSeen: true,
          active: true,
          currentStage: stage,
          uiMode: "stage-intro",
          guideIndex: 0,
          navigatePhase: "section",
        })
        return stage
      },

      postponeWelcome: () =>
        set({
          welcomeSeen: true,
          ...ephemeralDefaults,
        }),

      openStageIntro: (stage) => {
        if (get().completedStages.includes(stage)) return
        set({
          active: true,
          currentStage: stage,
          uiMode: "stage-intro",
          guideIndex: 0,
          navigatePhase: "section",
          welcomeSeen: true,
        })
      },

      continueStageIntro: () => {
        if (!get().currentStage) return
        if (get().uiMode !== "stage-intro") return
        set({
          uiMode: "coachmark",
          guideIndex: 0,
          active: true,
        })
      },

      setGuideIndex: (index) =>
        set({ guideIndex: Math.max(0, index), uiMode: "coachmark", active: true }),

      advanceGuide: () =>
        set((state) => ({
          guideIndex: state.guideIndex + 1,
          uiMode: "coachmark",
          active: true,
        })),

      setNavigatePhase: (phase) => set({ navigatePhase: phase }),

      completeCurrentStage: () => {
        const stage = get().currentStage
        if (!stage) return null

        const completedStages = get().completedStages.includes(stage)
          ? get().completedStages
          : [...get().completedStages, stage]

        const nextStage = getNextStageId(stage)
        const finished = isTourComplete(completedStages)

        if (finished || !nextStage) {
          set({
            completedStages,
            welcomeSeen: true,
            ...ephemeralDefaults,
            uiMode: "finished",
          })
          return { completedStage: stage, nextStage: null, finished: true }
        }

        // Session-only navigate guide — not written to durable storage.
        set({
          completedStages,
          currentStage: nextStage,
          active: true,
          uiMode: "navigate",
          guideIndex: 0,
          navigatePhase: "section",
          welcomeSeen: true,
        })

        return { completedStage: stage, nextStage, finished: false }
      },

      dismissTourUi: () => {
        const completed = get().completedStages
        set({
          ...ephemeralDefaults,
          welcomeSeen: true,
          completedStages: completed,
          uiMode: isTourComplete(completed) ? "finished" : "idle",
        })
      },

      skipCurrentStage: () => {
        const stage =
          get().currentStage ?? getFirstIncompleteStage(get().completedStages)
        if (!stage) return null
        if (get().completedStages.includes(stage)) {
          return getFirstIncompleteStage(get().completedStages)
        }

        const completedStages = [...get().completedStages, stage]
        const nextStage = getNextStageId(stage)
        const finished = isTourComplete(completedStages)

        if (finished || !nextStage) {
          set({
            completedStages,
            welcomeSeen: true,
            ...ephemeralDefaults,
            uiMode: "finished",
          })
          return null
        }

        set({
          completedStages,
          welcomeSeen: true,
          currentStage: nextStage,
          active: true,
          uiMode: "navigate",
          guideIndex: 0,
          navigatePhase: "section",
        })
        return nextStage
      },

      resumeTour: () => {
        const completed = get().completedStages
        if (isTourComplete(completed)) {
          set({
            ...ephemeralDefaults,
            welcomeSeen: true,
            completedStages: completed,
            uiMode: "finished",
          })
          return null
        }
        const stage = getFirstIncompleteStage(completed)
        if (!stage) return null
        // Go straight into the stage page flow (intro), not sticky menu navigate.
        set({
          active: true,
          currentStage: stage,
          uiMode: "stage-intro",
          guideIndex: 0,
          navigatePhase: "section",
          welcomeSeen: true,
        })
        return stage
      },

      markStageComplete: (stage) =>
        set((state) => ({
          completedStages: state.completedStages.includes(stage)
            ? state.completedStages
            : [...state.completedStages, stage],
        })),

      reconcileAfterHydration: () => {
        const completed = normalizeCompleted(get().completedStages)
        if (isTourComplete(completed)) {
          set({
            completedStages: completed,
            welcomeSeen: true,
            ...ephemeralDefaults,
            uiMode: "finished",
          })
          return
        }
        // Drop any stuck navigate/coachmark that leaked from older builds.
        const mode = get().uiMode
        if (
          mode === "navigate" ||
          mode === "coachmark" ||
          mode === "stage-intro" ||
          mode === "welcome"
        ) {
          // Keep welcome only if not seen yet; otherwise idle.
          if (!get().welcomeSeen && mode === "welcome") return
          set({
            completedStages: completed,
            ...ephemeralDefaults,
            welcomeSeen: get().welcomeSeen,
            uiMode: "idle",
          })
          return
        }
        set({ completedStages: completed })
      },

      resetTour: () =>
        set({
          welcomeSeen: false,
          completedStages: [],
          ...ephemeralDefaults,
        }),
    }),
    {
      name: "kassapay-tour",
      version: 2,
      // CRITICAL: never persist active/uiMode/currentStage — that stuck the menu tip after refresh.
      partialize: (state): TourPersistedSlice => ({
        welcomeSeen: state.welcomeSeen,
        completedStages: state.completedStages,
      }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<TourPersistedSlice> &
          Record<string, unknown>
        return {
          welcomeSeen: Boolean(state.welcomeSeen),
          completedStages: normalizeCompleted(state.completedStages),
        }
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<TourPersistedSlice>
        return {
          ...current,
          welcomeSeen: Boolean(p.welcomeSeen),
          completedStages: normalizeCompleted(p.completedStages),
          // Always start UI clean after reload.
          ...ephemeralDefaults,
          uiMode: isTourComplete(normalizeCompleted(p.completedStages))
            ? ("finished" as TourUiMode)
            : ("idle" as TourUiMode),
        }
      },
    }
  )
)

export { isTourComplete, getFirstIncompleteStage }
