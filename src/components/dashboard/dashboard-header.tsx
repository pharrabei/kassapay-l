"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home03Icon,
  Moon01Icon,
  Sun01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { getDashboardCopy, type DirectoryKind } from "@/lib/dashboard-i18n"
import {
  getDashboardPath,
  getLocalePrefix,
  normalizeAppPath,
} from "@/lib/routing"
import { useLanguageStore, type AppLanguage } from "@/store/language-store"
import { useProfileStore } from "@/store/profile-store"
import { ProfileDialog } from "@/components/dashboard/profile-dialog"
import { NotificationsPopover } from "@/components/dashboard/notifications-popover"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

const directoryPathPattern =
  /^\/dashboard\/directories\/(contractors|objects|events|service-categories|services|sessions)$/

const headerIconButtonClass =
  "relative flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"

function stripLocalePrefix(pathname: string) {
  return normalizeAppPath(
    pathname.replace(/^\/(ru|kk|en)(?=\/|$)/, "") || "/"
  )
}

function withLocalePrefix(path: string, locale: string | null) {
  return locale ? `/${locale}${path}` : path
}

function getBreadcrumbItems(
  pathname: string,
  copy: ReturnType<typeof getDashboardCopy>
): BreadcrumbItem[] {
  const locale = getLocalePrefix(pathname)
  const normalizedPathname = stripLocalePrefix(pathname)
  const dashboardPath = getDashboardPath(pathname)

  const items: BreadcrumbItem[] = [{ label: copy.header.dashboard }]

  const directoryMatch = normalizedPathname.match(directoryPathPattern)
  if (directoryMatch) {
    const directoryKind = directoryMatch[1] as DirectoryKind

    return [
      { label: copy.header.dashboard, href: dashboardPath },
      { label: copy.sidebar.nav.directories },
      { label: copy.directories.pages[directoryKind].title },
    ]
  }

  if (normalizedPathname.startsWith("/dashboard/directories")) {
    return [
      { label: copy.header.dashboard, href: dashboardPath },
      { label: copy.sidebar.nav.directories },
    ]
  }

  if (normalizedPathname !== "/dashboard") {
    items.push({
      label:
        normalizedPathname
          .split("/")
          .filter(Boolean)
          .at(-1)
          ?.replaceAll("-", " ") ?? copy.header.dashboard,
      href: withLocalePrefix(normalizedPathname, locale),
    })
  }

  return items
}

function LanguageToggle({
  language,
  setLanguage,
  label,
  languages,
}: {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  label: string
  languages: Record<AppLanguage, string>
}) {
  const nextLanguage: AppLanguage = language === "ru" ? "kk" : "ru"

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      className={cn(headerIconButtonClass, "min-w-10 px-2 text-xs font-semibold")}
      aria-label={`${label}: ${languages[language]}. ${languages[nextLanguage]}`}
      title={`${label}: ${languages[nextLanguage]}`}
    >
      {languages[language]}
    </button>
  )
}

function ThemeToggle({
  label,
  lightLabel,
  darkLabel,
}: {
  label: string
  lightLabel: string
  darkLabel: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={headerIconButtonClass}
      aria-label={isDark ? lightLabel : darkLabel}
      title={isDark ? lightLabel : darkLabel}
      disabled={!mounted}
    >
      {mounted ? (
        <HugeiconsIcon
          icon={isDark ? Sun01Icon : Moon01Icon}
          size={17}
          strokeWidth={2}
        />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  )
}

export function DashboardHeader() {
  const pathname = usePathname()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const profile = useProfileStore((state) => state.profile)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const copy = getDashboardCopy(language)
  const breadcrumbs = getBreadcrumbItems(pathname, copy)
  const dashboardPath = getDashboardPath(pathname)

  // Sync document language for a11y/SEO with in-app language toggle.
  React.useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Sidebar "Профиль" and other callers open the same dialog.
  React.useEffect(() => {
    function onOpenProfile() {
      setProfileOpen(true)
    }
    window.addEventListener("kassapay:open-profile", onOpenProfile)
    return () => window.removeEventListener("kassapay:open-profile", onOpenProfile)
  }, [])

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 sm:h-16 sm:px-6">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm sm:gap-2">
            <li className="flex min-w-0 items-center">
              <Link
                href={dashboardPath}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={copy.header.dashboard}
                title={copy.header.dashboard}
              >
                <HugeiconsIcon icon={Home03Icon} size={16} strokeWidth={2} />
              </Link>
            </li>
            {breadcrumbs.map((item, index) => {
              const isCurrent = index === breadcrumbs.length - 1

              return (
                <React.Fragment key={`${item.label}-${index}`}>
                  <li className="text-muted-foreground" aria-hidden="true">
                    /
                  </li>
                  <li className="min-w-0 truncate">
                    {item.href && !isCurrent ? (
                      <Link
                        href={item.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={
                          isCurrent
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                </React.Fragment>
              )
            })}
          </ol>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageToggle
            language={language}
            setLanguage={setLanguage}
            label={copy.header.language}
            languages={copy.header.languages}
          />

          <ThemeToggle
            label={copy.header.theme}
            lightLabel={copy.header.themeLight}
            darkLabel={copy.header.themeDark}
          />

          <NotificationsPopover language={language} copy={copy.header} />

          <button
            type="button"
            className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-foreground transition-colors hover:bg-muted/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            aria-label={copy.header.editProfile}
            title={copy.header.editProfile}
            onClick={() => setProfileOpen(true)}
          >
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt={copy.header.profile}
                className="size-full object-cover"
              />
            ) : (
              <HugeiconsIcon icon={UserIcon} size={17} strokeWidth={2} />
            )}
          </button>
        </div>
      </header>

      {profileOpen ? (
        <ProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          copy={copy.profile}
        />
      ) : null}
    </>
  )
}
