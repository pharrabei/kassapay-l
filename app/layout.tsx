import { Geist_Mono, Montserrat } from "next/font/google"

import "./globals.css"
import { NavigationLoader } from "@/components/navigation-loader"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        fontMono.variable,
        montserrat.variable
      )}
    >
      <body>
        <ThemeProvider>
          {children}
          <NavigationLoader />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
