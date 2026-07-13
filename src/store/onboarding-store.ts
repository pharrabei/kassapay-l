"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { OnboardingStepId } from "@/lib/dashboard-i18n"

export type OnboardingDraftValue = string | boolean | string[]

interface OnboardingState {
  currentStep: OnboardingStepId
  completedStepIds: OnboardingStepId[]
  drafts: Record<string, OnboardingDraftValue>
  setCurrentStep: (step: OnboardingStepId) => void
  updateDraft: (name: string, value: OnboardingDraftValue) => void
  patchDrafts: (patch: Record<string, OnboardingDraftValue>) => void
  markStepComplete: (step: OnboardingStepId) => void
  unmarkStepComplete: (step: OnboardingStepId) => void
  reconcileCompletedSteps: () => void
  resetProgress: () => void
}

export const onboardingStepIds: OnboardingStepId[] = [
  "contractors",
  "object",
  "services",
  "events",
  "sessions",
]

export function isOnboardingComplete(
  completedStepIds: readonly OnboardingStepId[]
) {
  return onboardingStepIds.every((stepId) => completedStepIds.includes(stepId))
}

const legacyStepMap: Record<string, OnboardingStepId> = {
  categories: "services",
}

function asString(value: OnboardingDraftValue | undefined) {
  return typeof value === "string" ? value.trim() : ""
}

/** A completed flag only counts if step actually has primary data. */
export function hasStepEvidence(
  stepId: OnboardingStepId,
  drafts: Record<string, OnboardingDraftValue>
) {
  switch (stepId) {
    case "contractors":
      return Boolean(asString(drafts.contractorName) || asString(drafts.bin))
    case "object":
      return Boolean(asString(drafts.objectName))
    case "services":
      return Boolean(asString(drafts.serviceName))
    case "events":
      return Boolean(asString(drafts.eventName))
    case "sessions":
      return Boolean(asString(drafts.sessionName))
    default:
      return false
  }
}

function normalizeStepId(step: string | undefined): OnboardingStepId {
  if (!step) return "contractors"
  if (legacyStepMap[step]) return legacyStepMap[step]
  if (onboardingStepIds.includes(step as OnboardingStepId)) {
    return step as OnboardingStepId
  }
  return "contractors"
}

function normalizeCompleted(ids: string[] | undefined): OnboardingStepId[] {
  if (!ids?.length) return []
  const next = new Set<OnboardingStepId>()
  for (const id of ids) {
    if (id === "categories") continue
    if (onboardingStepIds.includes(id as OnboardingStepId)) {
      next.add(id as OnboardingStepId)
    }
  }
  return onboardingStepIds.filter((id) => next.has(id))
}

export function reconcileCompletedStepIds(
  ids: readonly OnboardingStepId[] | undefined,
  drafts: Record<string, OnboardingDraftValue>
): OnboardingStepId[] {
  return normalizeCompleted(ids as string[] | undefined).filter((stepId) =>
    hasStepEvidence(stepId, drafts)
  )
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: "contractors",
      completedStepIds: [],
      drafts: {},
      setCurrentStep: (step) => set({ currentStep: normalizeStepId(step) }),
      updateDraft: (name, value) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [name]: value,
          },
        })),
      patchDrafts: (patch) =>
        set((state) => {
          const drafts = { ...state.drafts }
          for (const [key, value] of Object.entries(patch)) {
            const current = drafts[key]
            if (
              typeof current === "string" &&
              current.trim() &&
              typeof value === "string"
            ) {
              continue
            }
            if (Array.isArray(current) && current.length > 0) continue
            drafts[key] = value
          }
          return { drafts }
        }),
      markStepComplete: (step) =>
        set((state) => {
          if (!hasStepEvidence(step, state.drafts)) {
            return {
              completedStepIds: state.completedStepIds.filter((id) => id !== step),
            }
          }
          return {
            completedStepIds: state.completedStepIds.includes(step)
              ? state.completedStepIds
              : [...state.completedStepIds, step],
          }
        }),
      unmarkStepComplete: (step) =>
        set((state) => ({
          completedStepIds: state.completedStepIds.filter((id) => id !== step),
        })),
      reconcileCompletedSteps: () =>
        set((state) => {
          const completedStepIds = reconcileCompletedStepIds(
            state.completedStepIds,
            state.drafts
          )
          const firstIncomplete =
            onboardingStepIds.find((id) => !completedStepIds.includes(id)) ??
            "contractors"
          return {
            completedStepIds,
            currentStep:
              completedStepIds.length === onboardingStepIds.length
                ? normalizeStepId(state.currentStep)
                : firstIncomplete,
          }
        }),
      resetProgress: () =>
        set({
          currentStep: "contractors",
          completedStepIds: [],
          drafts: {},
        }),
    }),
    {
      name: "kassapay-onboarding",
      version: 4,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<OnboardingState>
        const drafts = state.drafts ?? {}
        const completedStepIds = reconcileCompletedStepIds(
          normalizeCompleted(state.completedStepIds as string[] | undefined),
          drafts
        )
        return {
          currentStep: normalizeStepId(state.currentStep),
          completedStepIds,
          drafts,
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Extra safety after rehydrate for already-versioned stores.
        const completedStepIds = reconcileCompletedStepIds(
          state.completedStepIds,
          state.drafts
        )
        useOnboardingStore.setState({ completedStepIds })
      },
    }
  )
)
