"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/tour-timing"

/** spotlight = dim + ring; tip = arrow tip only (menu/nav); field = tip + input outline */
export type CoachmarkMode = "spotlight" | "tip" | "field"
export type TipPlacement = "auto" | "right" | "left" | "top" | "bottom"

interface CoachmarkProps {
  target: string
  text: string
  mode?: CoachmarkMode
  refreshKey?: string | number | boolean
  preferSide?: TipPlacement
  /** When target leaves the DOM, hide tip instead of freezing last position. */
  hideWhenMissing?: boolean
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

type ArrowEdge = "top" | "bottom" | "left" | "right"

type Placement = {
  top: number
  left: number
  transform: string
  arrow: ArrowEdge
}

type Frame = {
  top: number
  left: number
  width: number
  height: number
  radius: string
}

function measure(target: string): Rect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    bottom: r.bottom,
    right: r.right,
  }
}

function resolvePlacement(
  rect: Rect,
  prefer: TipPlacement,
  tipW: number,
  tipH: number
): Placement {
  const gap = 14
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pad = 12
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const space = {
    top: rect.top - pad,
    bottom: vh - rect.bottom - pad,
    left: rect.left - pad,
    right: vw - rect.right - pad,
  }

  const order: TipPlacement[] =
    prefer === "right"
      ? ["right", "bottom", "top", "left"]
      : prefer === "top"
        ? ["top", "bottom", "right", "left"]
        : prefer === "bottom"
          ? ["bottom", "top", "left", "right"]
          : space.bottom >= tipH + gap
            ? ["bottom", "top", "right", "left"]
            : space.top >= tipH + gap
              ? ["top", "bottom", "right", "left"]
              : ["right", "bottom", "top", "left"]

  for (const side of order) {
    if (side === "auto") continue

    if (side === "bottom" && space.bottom >= Math.min(tipH + gap, 56)) {
      return {
        top: rect.bottom + gap,
        left: Math.min(Math.max(pad + tipW / 2, cx), vw - pad - tipW / 2),
        transform: "translate(-50%, 0)",
        arrow: "top",
      }
    }

    if (side === "top" && space.top >= Math.min(tipH + gap, 56)) {
      return {
        top: rect.top - gap,
        left: Math.min(Math.max(pad + tipW / 2, cx), vw - pad - tipW / 2),
        transform: "translate(-50%, -100%)",
        arrow: "bottom",
      }
    }

    if (side === "right" && space.right >= Math.min(tipW + gap, 80)) {
      return {
        top: Math.min(Math.max(pad + tipH / 2, cy), vh - pad - tipH / 2),
        left: rect.right + gap,
        transform: "translate(0, -50%)",
        arrow: "left",
      }
    }

    if (side === "left" && space.left >= Math.min(tipW + gap, 80)) {
      return {
        top: Math.min(Math.max(pad + tipH / 2, cy), vh - pad - tipH / 2),
        left: rect.left - gap,
        transform: "translate(-100%, -50%)",
        arrow: "right",
      }
    }
  }

  return {
    top: Math.min(rect.bottom + gap, vh - tipH - pad),
    left: Math.min(Math.max(pad + tipW / 2, cx), vw - pad - tipW / 2),
    transform: "translate(-50%, 0)",
    arrow: "top",
  }
}

/**
 * Stable coachmark:
 * - Never paint at (0,0): UI mounts only after first valid measure
 * - Opacity fade only after geometry is set
 * - No CSS transitions on top/left (avoids corner flash)
 */
export function Coachmark({
  target,
  text,
  mode = "spotlight",
  refreshKey,
  preferSide = "auto",
  hideWhenMissing = false,
}: CoachmarkProps) {
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [frame, setFrame] = React.useState<Frame | null>(null)
  const [placement, setPlacement] = React.useState<Placement | null>(null)

  const measureBoxRef = React.useRef<HTMLDivElement>(null)
  const reduced = prefersReducedMotion()
  const showChrome = mode === "spotlight"
  // Only form fields get inline outline — never menu/nav items (white bg kills label).
  const isFieldTip = mode === "field"
  const missingFramesRef = React.useRef(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Target class hooks (ring chrome / field outline) — tip mode paints nothing on target
  React.useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
    if (!el) return
    if (showChrome) el.classList.add("tour-target-active")
    if (isFieldTip) el.classList.add("tour-field-pointed")
    return () => {
      el.classList.remove("tour-target-active")
      el.classList.remove("tour-field-pointed")
    }
  }, [target, refreshKey, showChrome, isFieldTip])

  // Measure loop — only commit state when values actually change
  React.useEffect(() => {
    let live = true
    let revealed = false
    let raf = 0
    missingFramesRef.current = 0
    setVisible(false)
    setFrame(null)
    setPlacement(null)

    const prefer: TipPlacement =
      preferSide === "auto"
        ? isFieldTip
          ? "top"
          : "bottom"
        : preferSide

    const readTipSize = () => {
      const box = measureBoxRef.current
      if (!box) return { w: 200, h: 44 }
      return {
        w: Math.max(box.offsetWidth, 120),
        h: Math.max(box.offsetHeight, 36),
      }
    }

    const clearGeometry = () => {
      revealed = false
      setVisible(false)
      setFrame(null)
      setPlacement(null)
    }

    const tick = () => {
      if (!live) return
      const rect = measure(target)
      if (!rect) {
        missingFramesRef.current += 1
        // ~10 frames missing ≈ hide ghost tip (menu closed / route change).
        if (hideWhenMissing || revealed) {
          if (missingFramesRef.current > 10) {
            clearGeometry()
          }
        }
        raf = window.requestAnimationFrame(tick)
        return
      }

      missingFramesRef.current = 0

      const el = document.querySelector(
        `[data-tour="${target}"]`
      ) as HTMLElement | null
      const radius = el ? getComputedStyle(el).borderRadius || "8px" : "8px"
      const nextFrame: Frame = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        radius,
      }

      const { w, h } = readTipSize()
      const nextPlace = resolvePlacement(rect, prefer, w, h)

      setFrame((prev) => {
        if (
          prev &&
          Math.abs(prev.top - nextFrame.top) < 0.5 &&
          Math.abs(prev.left - nextFrame.left) < 0.5 &&
          Math.abs(prev.width - nextFrame.width) < 0.5 &&
          Math.abs(prev.height - nextFrame.height) < 0.5
        ) {
          return prev
        }
        return nextFrame
      })

      setPlacement((prev) => {
        if (
          prev &&
          Math.abs(prev.top - nextPlace.top) < 0.5 &&
          Math.abs(prev.left - nextPlace.left) < 0.5 &&
          prev.arrow === nextPlace.arrow
        ) {
          return prev
        }
        return nextPlace
      })

      if (!revealed) {
        revealed = true
        // Geometry committed this frame → fade in on next paints
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (live) setVisible(true)
          })
        })

        window.setTimeout(() => {
          if (!live) return
          document
            .querySelector<HTMLElement>(`[data-tour="${target}"]`)
            ?.scrollIntoView({
              block: "nearest",
              inline: "nearest",
              behavior: reduced ? "auto" : "smooth",
            })
        }, reduced ? 0 : 160)
      }

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => {
      live = false
      window.cancelAnimationFrame(raf)
    }
  }, [target, refreshKey, preferSide, isFieldTip, reduced, hideWhenMissing])

  if (!mounted) return null

  const fade = reduced ? "opacity 0ms linear" : "opacity 200ms ease"

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-live="polite">
      {/* Hidden sizer so we know tip dimensions before first show */}
      <div
        ref={measureBoxRef}
        className="invisible absolute -left-[9999px] top-0 max-w-[min(16rem,calc(100vw-1.5rem))] px-3 py-2 text-[13px] leading-snug font-medium"
        aria-hidden
      >
        {text}
      </div>

      {/* Spotlight chrome — only after measure, never at 0×0 visible */}
      {showChrome && frame ? (
        <>
          <div
            className="tour-hole absolute"
            style={{
              top: frame.top,
              left: frame.left,
              width: frame.width,
              height: frame.height,
              borderRadius: frame.radius,
              opacity: visible ? 1 : 0,
              transition: fade,
            }}
          />
          <div
            className="tour-ring absolute"
            style={{
              top: frame.top,
              left: frame.left,
              width: frame.width,
              height: frame.height,
              borderRadius: frame.radius,
              opacity: visible ? 1 : 0,
              transition: fade,
            }}
          />
        </>
      ) : null}

      {placement ? (
        <div
          className={cn(
            "absolute z-[81] max-w-[min(16rem,calc(100vw-1.5rem))] rounded-lg",
            "border border-primary/30 bg-popover px-3 py-2 text-[13px] leading-snug",
            "text-popover-foreground shadow-lg"
          )}
          style={{
            top: placement.top,
            left: placement.left,
            transform: placement.transform,
            opacity: visible ? 1 : 0,
            transition: fade,
          }}
          role="status"
        >
          <p className="font-medium">{text}</p>
          <span
            className={cn(
              "pointer-events-none absolute size-2.5 rotate-45 border-primary/35 bg-popover",
              placement.arrow === "bottom" &&
                "bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b",
              placement.arrow === "top" &&
                "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l",
              placement.arrow === "left" &&
                "top-1/2 left-[-5px] -translate-y-1/2 border-b border-l",
              placement.arrow === "right" &&
                "top-1/2 right-[-5px] -translate-y-1/2 border-t border-r"
            )}
            aria-hidden
          />
        </div>
      ) : null}
    </div>,
    document.body
  )
}
