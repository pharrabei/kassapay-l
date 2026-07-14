"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArchiveIcon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DashboardSquare01Icon,
  FilterHorizontalIcon,
  Folder01Icon,
  FolderOpenIcon,
  Invoice01Icon,
  Logout03Icon,
  Search01Icon,
  SecurityCheckIcon,
  Settings02Icon,
  Task01Icon,
  TimeQuarterPassIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import {
  getDashboardCopy,
  type DashboardIconKey,
  type DashboardMenuItemCopy,
  type DashboardMenuSectionCopy,
  type SidebarSectionId,
} from "@/lib/dashboard-i18n"
import { withBasePath } from "@/lib/base-path"
import { normalizeAppPath } from "@/lib/routing"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguageStore } from "@/store/language-store"
import { useTourStore } from "@/store/tour-store"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function tourNavFromHref(href?: string) {
  if (!href) return undefined
  const match = href.match(/\/dashboard\/directories\/([^/?#]+)/)
  return match?.[1] ? `tour-nav-${match[1]}` : undefined
}

const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)"
const logoSrc = withBasePath("/Logo.svg?v=5")

const iconMap = {
  dashboard: DashboardSquare01Icon,
  invoice: Invoice01Icon,
  task: Task01Icon,
  filter: FilterHorizontalIcon,
  time: TimeQuarterPassIcon,
  check: CheckmarkCircle02Icon,
  folderOpen: FolderOpenIcon,
  folder: Folder01Icon,
  calendar: Calendar03Icon,
  users: UserGroupIcon,
  archive: ArchiveIcon,
  user: UserIcon,
  security: SecurityCheckIcon,
  settings: Settings02Icon,
} satisfies Record<DashboardIconKey, typeof DashboardSquare01Icon>

function stripLocalePrefix(pathname: string) {
  return normalizeAppPath(
    pathname.replace(/^\/(ru|kk|en)(?=\/|$)/, "") || "/"
  )
}

/** Exact match for /dashboard so nested routes do not light up "Обзор аккаунта". */
function isMenuHrefActive(pathname: string, href?: string) {
  if (!href) return false
  const path = stripLocalePrefix(pathname)
  const target = normalizeAppPath(href)
  if (target === "/dashboard") return path === "/dashboard"
  return path === target || path.startsWith(`${target}/`)
}

function Icon({
  icon,
  size = 16,
  className = "text-zinc-50",
}: {
  icon: typeof DashboardSquare01Icon
  size?: number
  className?: string
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={2}
      className={className}
    />
  )
}

function BrandBadge() {
  return (
    <div className="relative w-full shrink-0">
      <div className="flex h-14 w-full items-center px-2">
        <Image
          src={logoSrc}
          alt="KassaPay"
          width={221}
          height={44}
          className="h-11 w-auto object-contain object-left"
          priority
        />
      </div>
    </div>
  )
}

function SearchContainer({
  isCollapsed = false,
  placeholder,
  value,
  onChange,
}: {
  isCollapsed?: boolean
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 transition-all duration-300",
        isCollapsed ? "flex w-full justify-center" : "w-full"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={cn(
          "relative flex h-10 items-center rounded-lg bg-zinc-900 transition-all duration-300",
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        )}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center transition-all duration-300",
            isCollapsed ? "p-1" : "px-1"
          )}
        >
          <div className="flex size-8 items-center justify-center text-zinc-400">
            <Icon icon={Search01Icon} className="text-current" />
          </div>
        </div>

        <div
          className={cn(
            "relative flex-1 overflow-hidden transition-opacity duration-300",
            isCollapsed ? "w-0 opacity-0" : "opacity-100"
          )}
        >
          <input
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 w-full border-none bg-transparent pr-2 text-sm leading-5 text-zinc-50 outline-none placeholder:text-zinc-500"
            tabIndex={isCollapsed ? -1 : 0}
            aria-label={placeholder}
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg border border-zinc-700"
        />
      </div>
    </div>
  )
}

function IconNavButton({
  children,
  isActive = false,
  onClick,
  label,
}: {
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-10 min-w-10 items-center justify-center rounded-lg transition-colors duration-200",
        isActive
          ? "bg-zinc-800 text-zinc-50"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
      )}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      title={label}
    >
      {children}
    </button>
  )
}

function IconNavLink({
  href,
  children,
  label,
}: {
  href: string
  children: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex size-10 min-w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-zinc-50"
      aria-label={label}
      title={label}
    >
      {children}
    </Link>
  )
}

function IconNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: SidebarSectionId
  onSectionChange: (section: SidebarSectionId) => void
}) {
  const language = useLanguageStore((state) => state.language)
  const copy = getDashboardCopy(language).sidebar
  const navItems: Array<{
    id: SidebarSectionId
    icon: typeof DashboardSquare01Icon
    label: string
  }> = [
    { id: "dashboard", icon: DashboardSquare01Icon, label: copy.nav.dashboard },
    { id: "directories", icon: Folder01Icon, label: copy.nav.directories },
  ]

  return (
    <aside className="flex h-full w-14 shrink-0 flex-col items-center gap-2 border-r border-zinc-800 bg-black p-2 sm:w-16 sm:p-3">
      <div className="flex w-full flex-col items-center gap-2">
        {navItems.map((item) => (
          <div
            key={item.id}
            data-tour={
              item.id === "directories" ? "tour-nav-section-directories" : undefined
            }
            className="rounded-lg"
          >
            <IconNavButton
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              label={item.label}
            >
              <Icon
                icon={item.icon}
                className={
                  activeSection === item.id ? "text-zinc-50" : "text-current"
                }
              />
            </IconNavButton>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex w-full flex-col items-center gap-2">
        <IconNavButton
          isActive={activeSection === "settings"}
          onClick={() => onSectionChange("settings")}
          label={copy.settings}
        >
          <Icon
            icon={Settings02Icon}
            className={
              activeSection === "settings" ? "text-zinc-50" : "text-current"
            }
          />
        </IconNavButton>
        <IconNavLink href="/auth" label={copy.logout}>
          <Icon icon={Logout03Icon} className="text-current" />
        </IconNavLink>
      </div>
    </aside>
  )
}

function ChevronIcon({ expanded = false }: { expanded?: boolean }) {
  return (
    <svg
      className="size-4 transition-transform duration-300"
      style={{
        transitionTimingFunction: softSpringEasing,
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
      }}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 11L3 6.00001L3.7 5.30001L8 9.60001L12.3 5.30001L13 6.00001L8 11Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
  expandLabel,
  collapseLabel,
  showCollapse = true,
}: {
  title: string
  onToggleCollapse: () => void
  isCollapsed: boolean
  expandLabel: string
  collapseLabel: string
  showCollapse?: boolean
}) {
  if (isCollapsed) {
    return (
      <div className="flex w-full justify-center">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex size-10 min-w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
          aria-label={expandLabel}
        >
          <span className="inline-block rotate-180">
            <ChevronIcon />
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex h-10 items-center">
          <div className="px-2 py-1">
            <div className="text-lg leading-7 font-semibold text-zinc-50">
              {title}
            </div>
          </div>
        </div>
        {showCollapse ? (
          <div className="pr-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex size-10 min-w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
              aria-label={collapseLabel}
            >
              <span className="-rotate-90">
                <ChevronIcon />
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function resolveMenuAction(item: DashboardMenuItemCopy): {
  href?: string
  action?: "open-profile"
  disabled?: boolean
} {
  if (item.href) return { href: item.href }

  // Map known settings labels to real actions (ru + kk).
  const label = item.label.trim().toLowerCase()
  if (
    item.icon === "user" ||
    label.includes("профиль") ||
    label.includes("profile")
  ) {
    return { action: "open-profile" }
  }

  // Placeholder items without routes stay non-interactive.
  if (
    item.icon === "security" ||
    item.icon === "settings" ||
    item.icon === "check"
  ) {
    return { disabled: true }
  }

  return { disabled: true }
}

function MenuItemRow({
  item,
  isExpanded,
  onToggle,
  isCollapsed,
  isActive,
  onNavigate,
}: {
  item: DashboardMenuItemCopy
  isExpanded?: boolean
  onToggle?: () => void
  isCollapsed?: boolean
  isActive?: boolean
  onNavigate?: () => void
}) {
  const hasDropdown = Boolean(item.children?.length)
  const resolved = resolveMenuAction(item)
  const language = useLanguageStore((state) => state.language)
  const soonLabel = language === "kk" ? "Жақында" : "Скоро"

  const active = Boolean(isActive || item.active)

  const content = (
    <>
      <div className="flex size-8 shrink-0 items-center justify-center">
        <Icon
          icon={iconMap[item.icon]}
          className={
            resolved.disabled
              ? "text-zinc-500"
              : active
                ? "text-zinc-50"
                : "text-zinc-300"
          }
        />
      </div>

      <div
        className={cn(
          "relative min-w-0 flex-1 overflow-hidden transition-opacity duration-300",
          isCollapsed ? "w-0 opacity-0" : "ml-2.5 opacity-100"
        )}
      >
        <div
          className={cn(
            "truncate text-left text-sm leading-5",
            resolved.disabled
              ? "text-zinc-500"
              : active
                ? "font-medium text-zinc-50"
                : "text-zinc-100"
          )}
        >
          {item.label}
        </div>
      </div>

      {resolved.disabled && !isCollapsed ? (
        <span className="ml-2 shrink-0 rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
          {soonLabel}
        </span>
      ) : null}

      {hasDropdown && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center text-zinc-400 transition-opacity duration-300",
            isCollapsed ? "w-0 opacity-0" : "ml-1.5 opacity-100"
          )}
        >
          <ChevronIcon expanded={isExpanded} />
        </div>
      )}
    </>
  )

  // Solid fill only (no ring) so highlight fits fully inside the panel padding.
  const className = cn(
    "relative box-border flex items-center rounded-lg transition-colors duration-200",
    active ? "bg-zinc-800" : "hover:bg-zinc-800/80",
    resolved.disabled && "cursor-not-allowed opacity-70 hover:bg-transparent",
    isCollapsed
      ? "h-10 w-10 min-w-10 justify-center"
      : "h-10 w-full min-w-0 px-2.5"
  )

  return (
    <div
      className={cn(
        "relative shrink-0",
        isCollapsed ? "flex w-full justify-center" : "w-full"
      )}
    >
      {resolved.href ? (
        <Link
          href={resolved.href}
          data-tour={tourNavFromHref(resolved.href)}
          className={className}
          title={isCollapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={className}
          title={
            isCollapsed
              ? item.label
              : resolved.disabled
                ? `${item.label} — ${soonLabel}`
                : item.label
          }
          disabled={resolved.disabled && !hasDropdown}
          aria-disabled={resolved.disabled || undefined}
          onClick={() => {
            if (hasDropdown) {
              onToggle?.()
              return
            }
            if (resolved.action === "open-profile") {
              window.dispatchEvent(new CustomEvent("kassapay:open-profile"))
              onNavigate?.()
            }
          }}
        >
          {content}
        </button>
      )}
    </div>
  )
}

function MenuSectionBlock({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  pathname,
  query,
  onNavigate,
}: {
  section: DashboardMenuSectionCopy
  expandedItems: Set<string>
  onToggleExpanded: (itemKey: string) => void
  isCollapsed?: boolean
  pathname: string
  query: string
  onNavigate?: () => void
}) {
  const normalizedQuery = query.trim().toLowerCase()
  const items = section.items.filter((item) => {
    if (!normalizedQuery) return true
    if (item.label.toLowerCase().includes(normalizedQuery)) return true
    return item.children?.some((child) =>
      child.toLowerCase().includes(normalizedQuery)
    )
  })

  if (items.length === 0) return null

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden transition-all duration-300",
          isCollapsed ? "h-0 opacity-0" : "h-10 opacity-100"
        )}
      >
        <div className="flex h-10 items-center px-3">
          <div className="text-sm font-medium text-zinc-400">{section.title}</div>
        </div>
      </div>

      {items.map((item, index) => {
        const itemKey = `${section.title}-${index}-${item.label}`
        const isExpanded = expandedItems.has(itemKey)

        return (
          <div key={itemKey} className="flex w-full flex-col">
            <MenuItemRow
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              isCollapsed={isCollapsed}
              isActive={isMenuHrefActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="mb-2 flex flex-col gap-1">
                {item.children.map((child) => (
                  <div key={`${itemKey}-${child}`} className="w-full py-px pr-1 pl-9">
                    <div className="flex h-10 w-full items-center rounded-lg px-3 py-1 text-left text-sm text-zinc-400">
                      <span className="min-w-0 flex-1 truncate">{child}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DetailSidebarBody({
  activeSection,
  pathname,
  onClose,
  showCollapse,
  onNavigate,
}: {
  activeSection: SidebarSectionId
  pathname: string
  onClose: () => void
  showCollapse: boolean
  onNavigate?: () => void
}) {
  const language = useLanguageStore((state) => state.language)
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  )
  const [searchValue, setSearchValue] = React.useState("")
  const copy = getDashboardCopy(language).sidebar
  const content = copy.content[activeSection] ?? copy.content.dashboard

  function toggleExpanded(itemKey: string) {
    setExpandedItems((previous) => {
      const next = new Set(previous)
      if (next.has(itemKey)) next.delete(itemKey)
      else next.add(itemKey)
      return next
    })
  }

  return (
    <>
      <BrandBadge />

      <SectionTitle
        title={content.title}
        onToggleCollapse={onClose}
        isCollapsed={false}
        expandLabel={copy.expand}
        collapseLabel={copy.collapse}
        showCollapse={showCollapse}
      />
      <SearchContainer
        isCollapsed={false}
        placeholder={copy.search}
        value={searchValue}
        onChange={setSearchValue}
      />

      <div className="flex w-full min-h-0 flex-1 flex-col items-stretch gap-3 overflow-x-hidden overflow-y-auto">
        {content.sections.map((section, index) => (
          <MenuSectionBlock
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={false}
            pathname={pathname}
            query={searchValue}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </>
  )
}

function DesktopDetailSidebar({
  activeSection,
  pathname,
  isOpen,
  onClose,
}: {
  activeSection: SidebarSectionId
  pathname: string
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col items-stretch gap-4 overflow-hidden bg-black p-3 text-zinc-50 shadow-2xl shadow-black/40 transition-all duration-200 sm:p-4 lg:w-80",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-3 opacity-0"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
      aria-hidden={!isOpen}
    >
      <DetailSidebarBody
        activeSection={activeSection}
        pathname={pathname}
        onClose={onClose}
        showCollapse
        onNavigate={onClose}
      />
    </aside>
  )
}

function getRouteSection(pathname: string): SidebarSectionId {
  return stripLocalePrefix(pathname).startsWith("/dashboard/directories")
    ? "directories"
    : "dashboard"
}

export function AppSidebar() {
  const pathname = usePathname()
  const normalizedPathname = stripLocalePrefix(pathname)
  const routeSection = getRouteSection(normalizedPathname)
  const isMobile = useIsMobile()
  const language = useLanguageStore((state) => state.language)
  const copy = getDashboardCopy(language).sidebar

  // Manual section only for icon-rail switches that don't change the URL.
  const [manualSection, setManualSection] =
    React.useState<SidebarSectionId | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [pathSnapshot, setPathSnapshot] = React.useState(normalizedPathname)

  // Close detail panel on route change (effect — avoids render-phase setState thrash).
  React.useEffect(() => {
    if (pathSnapshot === normalizedPathname) return
    setPathSnapshot(normalizedPathname)
    setManualSection(null)
    setDetailOpen(false)
  }, [normalizedPathname, pathSnapshot])

  // Tour / external request: open a section panel (e.g. directories after stage save).
  React.useEffect(() => {
    function onOpenSidebar(event: Event) {
      const detail = (event as CustomEvent<{ section?: SidebarSectionId }>).detail
      const section = detail?.section
      if (!section) return
      setManualSection(section)
      setDetailOpen(true)
    }
    window.addEventListener("kassapay:open-sidebar", onOpenSidebar)
    return () => window.removeEventListener("kassapay:open-sidebar", onOpenSidebar)
  }, [])

  function handleSectionChange(section: SidebarSectionId) {
    setManualSection(section)
    setDetailOpen(true)
    if (section === "directories") {
      const tour = useTourStore.getState()
      if (tour.uiMode === "navigate" && tour.navigatePhase === "section") {
        window.setTimeout(() => tour.setNavigatePhase("item"), 160)
      }
    }
  }

  const activeSection = manualSection ?? routeSection

  return (
    <>
      <div className="relative z-50 flex h-full w-14 shrink-0 sm:w-16">
        <IconNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {!isMobile ? (
          <div
            className={cn(
              "absolute top-0 left-14 z-50 h-full sm:left-16",
              !detailOpen && "pointer-events-none"
            )}
          >
            <DesktopDetailSidebar
              key={activeSection}
              activeSection={activeSection}
              pathname={normalizedPathname}
              isOpen={detailOpen}
              onClose={() => setDetailOpen(false)}
            />
          </div>
        ) : null}
      </div>

      {!isMobile && detailOpen ? (
        <button
          type="button"
          aria-label={copy.collapse}
          className="fixed inset-0 left-14 z-40 bg-background/50 backdrop-blur-sm transition-opacity sm:left-16"
          onClick={() => setDetailOpen(false)}
        />
      ) : null}

      {isMobile ? (
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent
            side="left"
            showCloseButton
            className="w-[min(100vw-2.5rem,20rem)] border-zinc-800 bg-black p-4 text-zinc-50 sm:max-w-sm"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{copy.content[activeSection]?.title ?? copy.nav.dashboard}</SheetTitle>
              <SheetDescription>{copy.search}</SheetDescription>
            </SheetHeader>
            <div className="flex h-full flex-col gap-4 pt-2">
              <DetailSidebarBody
                key={activeSection}
                activeSection={activeSection}
                pathname={normalizedPathname}
                onClose={() => setDetailOpen(false)}
                showCollapse={false}
                onNavigate={() => setDetailOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  )
}
