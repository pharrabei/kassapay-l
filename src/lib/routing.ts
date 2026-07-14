import { withBasePath } from "@/lib/base-path"

const LOCALE_PREFIX_PATTERN = /^\/(ru|kk|en)(?=\/|$)/

export function getLocalePrefix(pathname: string): string | null {
  const match = pathname.match(LOCALE_PREFIX_PATTERN)
  return match?.[1] ?? null
}

/** Strip trailing slash except for root (Next trailingSlash + GH Pages). */
export function normalizeAppPath(pathname: string): string {
  if (!pathname) return "/"
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function getDashboardPath(pathname: string): string {
  const locale = getLocalePrefix(pathname)
  return locale ? `/${locale}/dashboard` : "/dashboard"
}

/**
 * Hard navigation with basePath + trailing slash.
 * Soft client transitions are unreliable for Next static export on GitHub Pages.
 * Shows branded navigation spinner before leaving the page.
 */
export function navigateHard(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const withSlash =
    normalized.length > 1 && !normalized.endsWith("/")
      ? `${normalized}/`
      : normalized
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kassapay:navigation-start"))
    window.location.assign(withBasePath(withSlash))
  }
}
