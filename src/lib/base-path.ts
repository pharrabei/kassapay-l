/**
 * Public base path for GitHub Pages project site.
 * Empty string for local/production root hosting.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** Prefix a root-relative public asset or route with basePath when needed. */
export function withBasePath(path: string): string {
  if (
    !path ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path
  }

  const [pathname, query = ""] = path.split("?")
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`
  // Avoid double-prefix if caller already included basePath.
  if (basePath && normalized.startsWith(`${basePath}/`)) {
    return query ? `${normalized}?${query}` : normalized
  }
  const joined = `${basePath}${normalized}`
  return query ? `${joined}?${query}` : joined
}
