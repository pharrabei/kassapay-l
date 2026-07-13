/**
 * Custom next/image loader so public assets get the GitHub Pages basePath.
 * Default static export currently emits /Logo.svg without /kassapay-l prefix.
 */
export default function imageLoader({
  src,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  const [pathname, query = ""] = src.split("?")
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`

  if (base && normalized.startsWith(`${base}/`)) {
    return query ? `${normalized}?${query}` : normalized
  }

  const joined = `${base}${normalized}`
  return query ? `${joined}?${query}` : joined
}
