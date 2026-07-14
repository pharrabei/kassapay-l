/**
 * @deprecated Replaced by interactive tour (`@/store/tour-store`).
 * Kept so old imports/localStorage migrations don't break the build.
 */

export {
  isTourComplete as isOnboardingComplete,
} from "@/lib/tour-config"

export const onboardingStepIds = [
  "contractors",
  "object",
  "services",
  "events",
  "sessions",
] as const

export type OnboardingDraftValue = string | boolean | string[]

export function hasStepEvidence() {
  return false
}

export function reconcileCompletedStepIds() {
  return [] as string[]
}
