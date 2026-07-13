"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BellIcon,
  Home03Icon,
  Search01Icon,
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

interface BreadcrumbItem {
  label: string
  href?: string
}

const directoryPathPattern =
  /^\/dashboard\/directories\/(contractors|objects|events|service-categories|services|sessions)$/

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

function LanguageSwitch({
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
  return (
    <div
      className="flex h-10 items-center rounded-lg border border-border bg-muted/40 p-1"
      aria-label={label}
    >
      {[
        { value: "kk", label: languages.kk },
        { value: "ru", label: languages.ru },
      ].map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setLanguage(item.value as AppLanguage)}
          className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors ${
            language === item.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={language === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-sm">
            <li className="flex min-w-0 items-center">
              <Link
                href={dashboardPath}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

        <div className="flex min-w-0 items-center gap-3">
          <label className="relative hidden h-10 w-72 items-center md:flex">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 text-muted-foreground"
            />
            <input
              type="search"
              placeholder={copy.header.search}
              className="h-full w-full rounded-lg border border-border bg-muted/40 pr-3 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:ring-3 focus:ring-ring/40"
            />
          </label>

          <LanguageSwitch
            language={language}
            setLanguage={setLanguage}
            label={copy.header.language}
            languages={copy.header.languages}
          />

          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            aria-label={copy.header.notifications}
            title={copy.header.notifications}
          >
            <HugeiconsIcon icon={BellIcon} size={17} strokeWidth={2} />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          </button>

          <button
            type="button"
            className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground transition-colors hover:bg-muted/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
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
