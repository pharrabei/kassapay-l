import type { NextConfig } from "next"

/** GitHub project pages: https://pharrabei.github.io/kassapay-l/ */
const isGithubPages = process.env.GITHUB_PAGES === "true"
const basePathValue = isGithubPages ? "/kassapay-l" : ""

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages (no Node server).
  output: "export",
  // Project site lives under /kassapay-l, not the domain root.
  basePath: basePathValue || undefined,
  assetPrefix: basePathValue ? `${basePathValue}/` : undefined,
  trailingSlash: true,
  images: {
    // next/image optimizer requires a server — disable for static hosting.
    unoptimized: true,
    // Ensure /public assets also receive basePath (broken in default static export).
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  env: {
    // Available in client components for manual asset/path prefixing.
    NEXT_PUBLIC_BASE_PATH: basePathValue,
  },
  allowedDevOrigins: ["192.168.1.10"],
}

export default nextConfig
