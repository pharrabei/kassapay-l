/** Shared pacing for interactive onboarding — keep motion calm, not snappy. */

export const TOUR_TIMING = {
  /** Modal exit / enter settle before coachmark appears. */
  afterModalMs: 420,
  /** Delay after welcome start before hard navigation. */
  afterWelcomeStartMs: 280,
  /** Wait after field is filled before advancing to the next field. */
  fieldAdvanceMs: 2000,
  /** Pause after successful save toast before next page. */
  afterStageCompleteMs: 1100,
  /** Coachmark position move (CSS transition) — calm. */
  spotlightMs: 380,
  /** Tooltip fade / swap. */
  tooltipMs: 200,
  /** Smooth scroll when target is off-screen. */
  scrollBehavior: "smooth" as ScrollBehavior,
  /** Lerp factor for spotlight follow (0–1 per frame). */
  spotlightLerp: 0.14,
  /** How close rect must be before considering settled. */
  spotlightEpsilon: 0.6,
} as const

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function tourDelay(ms: number) {
  if (prefersReducedMotion()) return Math.min(ms, 120)
  return ms
}
