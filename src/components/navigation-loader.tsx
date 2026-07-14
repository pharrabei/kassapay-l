"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BrandLoader } from "@/components/ui/brand-loader"
import { normalizeAppPath } from "@/lib/routing"

const NAV_START_EVENT = "kassapay:navigation-start"
const NAV_END_EVENT = "kassapay:navigation-end"

/** Call before any hard/soft navigation to show the branded overlay. */
export function startNavigationLoader() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(NAV_START_EVENT))
}

export function stopNavigationLoader() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(NAV_END_EVENT))
}

function isModifiedClick(event: MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  )
}

function isInternalAppLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false
  if (anchor.hasAttribute("download")) return false

  const href = anchor.getAttribute("href")
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false
  }

  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) return false

    const current = normalizeAppPath(
      window.location.pathname.replace(/\/$/, "") || "/"
    )
    const next = normalizeAppPath(url.pathname.replace(/\/$/, "") || "/")
    // Ignore hash-only / same-path clicks.
    if (current === next && url.search === window.location.search) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Brand spinner for *hard* navigations and slow soft routes.
 * Soft dashboard Link transitions stay quiet — full overlay there felt like jank.
 */
export function NavigationLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = React.useState(false)
  const hideTimerRef = React.useRef<number | null>(null)
  const showDelayRef = React.useRef<number | null>(null)

  const clearTimers = React.useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    if (showDelayRef.current) {
      window.clearTimeout(showDelayRef.current)
      showDelayRef.current = null
    }
  }, [])

  const hide = React.useCallback(() => {
    clearTimers()
    setVisible(false)
  }, [clearTimers])

  const showImmediate = React.useCallback(() => {
    clearTimers()
    setVisible(true)
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false)
    }, 12_000)
  }, [clearTimers])

  /** Soft Link: only flash loader if navigation is actually slow (>220ms). */
  const showDeferred = React.useCallback(() => {
    if (showDelayRef.current || visible) return
    showDelayRef.current = window.setTimeout(() => {
      showDelayRef.current = null
      setVisible(true)
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false)
      }, 12_000)
    }, 220)
  }, [visible])

  // Soft route change finished → hide (and cancel deferred flash).
  React.useEffect(() => {
    hide()
  }, [pathname, hide])

  React.useEffect(() => {
    function onStart() {
      // Hard nav (navigateHard) — show right away.
      showImmediate()
    }
    function onEnd() {
      hide()
    }
    function onClick(event: MouseEvent) {
      if (isModifiedClick(event)) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest("a")
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (!isInternalAppLink(anchor)) return

      try {
        const url = new URL(anchor.href, window.location.href)
        const next = normalizeAppPath(url.pathname.replace(/\/$/, "") || "/")
        const current = normalizeAppPath(
          window.location.pathname.replace(/\/$/, "") || "/"
        )
        // Dashboard → dashboard soft hops: no full-screen flash.
        if (current.startsWith("/dashboard") && next.startsWith("/dashboard")) {
          return
        }
        // Leaving auth/register or long jumps: deferred loader (skip if instant).
        showDeferred()
      } catch {
        showDeferred()
      }
    }
    function onPageShow() {
      hide()
    }

    window.addEventListener(NAV_START_EVENT, onStart)
    window.addEventListener(NAV_END_EVENT, onEnd)
    window.addEventListener("pageshow", onPageShow)
    document.addEventListener("click", onClick, true)

    return () => {
      window.removeEventListener(NAV_START_EVENT, onStart)
      window.removeEventListener(NAV_END_EVENT, onEnd)
      window.removeEventListener("pageshow", onPageShow)
      document.removeEventListener("click", onClick, true)
      clearTimers()
    }
  }, [showImmediate, showDeferred, hide, clearTimers])

  if (!visible) return null

  return <BrandLoader fullScreen label="Загрузка..." />
}
