import type { NextConfig } from "next"

/** GitHub project pages: https://pharrabei.github.io/kassapay-l/ */
const isGithubPages = process.env.GITHUB_PAGES === "true"

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages (no Node server).
  output: "export",
  // Project site lives under /kassapay-l, not the domain root.
  basePath: isGithubPages ? "/kassapay-l" : undefined,
  assetPrefix: isGithubPages ? "/kassapay-l/" : undefined,
  trailingSlash: true,
  images: {
    // next/image optimizer requires a server — disable for static hosting.
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.1.10"],
}

export default nextConfig
