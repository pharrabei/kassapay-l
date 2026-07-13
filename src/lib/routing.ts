const LOCALE_PREFIX_PATTERN = /^\/(ru|kk|en)(?=\/|$)/

export function getLocalePrefix(pathname: string): string | null {
  const match = pathname.match(LOCALE_PREFIX_PATTERN)
  return match?.[1] ?? null
}

export function getDashboardPath(pathname: string): string {
  const locale = getLocalePrefix(pathname)
  return locale ? `/${locale}/dashboard` : "/dashboard"
}
