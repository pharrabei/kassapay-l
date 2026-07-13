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
import { useLanguageStore } from "@/store/language-store"

const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)"
const logoSrc = withBasePath("/Logo.svg?v=2")

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
  className = "text-neutral-50",
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
          className="h-11 w-auto object-contain"
          priority
        />
      </div>
    </div>
  )
}

function SearchContainer({
  isCollapsed = false,
  placeholder,
}: {
  isCollapsed?: boolean
  placeholder: string
}) {
  const [searchValue, setSearchValue] = React.useState("")

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "flex w-full justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`relative flex h-10 items-center rounded-lg bg-black transition-all duration-500 ${
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={`flex shrink-0 items-center justify-center transition-all duration-500 ${
            isCollapsed ? "p-1" : "px-1"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex size-8 items-center justify-center">
            <Icon icon={Search01Icon} />
          </div>
        </div>

        <div
          className={`relative flex-1 overflow-hidden transition-opacity duration-500 ${
            isCollapsed ? "w-0 opacity-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="h-10 w-full border-none bg-transparent pr-2 text-[14px] leading-5 text-neutral-50 outline-none placeholder:text-neutral-400"
            tabIndex={isCollapsed ? -1 : 0}
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg border border-neutral-800"
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
      className={`flex size-10 min-w-10 items-center justify-center rounded-lg transition-colors duration-500 ${
        isActive
          ? "bg-neutral-800 text-neutral-50"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
      aria-label={label}
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
      className="flex size-10 min-w-10 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-500 hover:bg-neutral-800 hover:text-neutral-300"
      style={{ transitionTimingFunction: softSpringEasing }}
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
    <aside className="flex h-full w-16 flex-col items-center gap-2 border-r border-neutral-800 bg-black p-4">
      <div className="flex w-full flex-col items-center gap-2">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
            label={item.label}
          >
            <Icon
              icon={item.icon}
              className={
                activeSection === item.id ? "text-neutral-50" : "text-current"
              }
            />
          </IconNavButton>
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
              activeSection === "settings" ? "text-neutral-50" : "text-current"
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
      className="size-4 transition-transform duration-500"
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
}: {
  title: string
  onToggleCollapse: () => void
  isCollapsed: boolean
  expandLabel: string
  collapseLabel: string
}) {
  if (isCollapsed) {
    return (
      <div
        className="flex w-full justify-center transition-all duration-500"
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex size-10 min-w-10 items-center justify-center rounded-lg text-neutral-400 transition-all duration-500 hover:bg-neutral-800 hover:text-neutral-300"
          style={{ transitionTimingFunction: softSpringEasing }}
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
    <div
      className="w-full overflow-hidden transition-all duration-500"
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 items-center">
          <div className="px-2 py-1">
            <div className="text-[18px] leading-[27px] font-semibold text-neutral-50">
              {title}
            </div>
          </div>
        </div>
        <div className="pr-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex size-10 min-w-10 items-center justify-center rounded-lg text-neutral-400 transition-all duration-500 hover:bg-neutral-800 hover:text-neutral-300"
            style={{ transitionTimingFunction: softSpringEasing }}
            aria-label={collapseLabel}
          >
            <span className="-rotate-90">
              <ChevronIcon />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuItemRow({
  item,
  isExpanded,
  onToggle,
  isCollapsed,
  isActive,
}: {
  item: DashboardMenuItemCopy
  isExpanded?: boolean
  onToggle?: () => void
  isCollapsed?: boolean
  isActive?: boolean
}) {
  const hasDropdown = Boolean(item.children?.length)
  const content = (
    <>
      <div className="flex shrink-0 items-center justify-center">
        <Icon icon={iconMap[item.icon]} />
      </div>

      <div
        className={`relative flex-1 overflow-hidden transition-opacity duration-500 ${
          isCollapsed ? "w-0 opacity-0" : "ml-3 opacity-100"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="truncate text-left text-[14px] leading-5 text-neutral-50">
          {item.label}
        </div>
      </div>

      {hasDropdown && (
        <div
          className={`flex shrink-0 items-center justify-center text-neutral-50 transition-opacity duration-500 ${
            isCollapsed ? "w-0 opacity-0" : "ml-2 opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <ChevronIcon expanded={isExpanded} />
        </div>
      )}
    </>
  )
  const className = `relative flex cursor-pointer items-center rounded-lg transition-all duration-500 ${
    item.active || isActive ? "bg-neutral-800" : "hover:bg-neutral-800"
  } ${
    isCollapsed
      ? "h-10 w-10 min-w-10 justify-center p-4"
      : "h-10 w-full px-4 py-2"
  }`

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "flex w-full justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {item.href ? (
        <Link
          href={item.href}
          className={className}
          style={{ transitionTimingFunction: softSpringEasing }}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={className}
          style={{ transitionTimingFunction: softSpringEasing }}
          onClick={() => {
            if (hasDropdown) onToggle?.()
          }}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </button>
      )}
    </div>
  )
}

function SubMenuItem({ label }: { label: string }) {
  return (
    <div className="w-full py-px pr-1 pl-9">
      <button
        type="button"
        className="flex h-10 w-full cursor-pointer items-center rounded-lg px-3 py-1 text-left transition-colors hover:bg-neutral-800"
      >
        <span className="min-w-0 flex-1 truncate text-[14px] leading-[18px] text-neutral-300">
          {label}
        </span>
      </button>
    </div>
  )
}

function MenuSectionBlock({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  pathname,
}: {
  section: DashboardMenuSectionCopy
  expandedItems: Set<string>
  onToggleExpanded: (itemKey: string) => void
  isCollapsed?: boolean
  pathname: string
}) {
  return (
    <div className="flex w-full flex-col">
      <div
        className={`relative w-full shrink-0 overflow-hidden transition-all duration-500 ${
          isCollapsed ? "h-0 opacity-0" : "h-10 opacity-100"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="flex h-10 items-center px-4">
          <div className="text-[14px] text-neutral-400">{section.title}</div>
        </div>
      </div>

      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`
        const isExpanded = expandedItems.has(itemKey)

        return (
          <div key={itemKey} className="flex w-full flex-col">
            <MenuItemRow
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              isCollapsed={isCollapsed}
              isActive={isMenuHrefActive(pathname, item.href)}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="mb-2 flex flex-col gap-1">
                {item.children.map((child) => (
                  <SubMenuItem key={`${itemKey}-${child}`} label={child} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DetailSidebar({
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
  const language = useLanguageStore((state) => state.language)
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set()
  )
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
    <aside
      className={cn(
        "flex h-full w-80 flex-col items-start gap-4 bg-black p-4 shadow-2xl shadow-black/40 transition-all duration-300",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-3 opacity-0"
      )}
      style={{ transitionTimingFunction: softSpringEasing }}
      aria-hidden={!isOpen}
    >
      <BrandBadge />

      <SectionTitle
        title={content.title}
        onToggleCollapse={onClose}
        isCollapsed={false}
        expandLabel={copy.expand}
        collapseLabel={copy.collapse}
      />
      <SearchContainer isCollapsed={false} placeholder={copy.search} />

      <div
        className="flex w-full flex-col items-start gap-4 overflow-y-auto"
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {content.sections.map((section, index) => (
          <MenuSectionBlock
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={false}
            pathname={pathname}
          />
        ))}
      </div>
      <div className="mt-auto" />
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

  // Manual section only for icon-rail switches that don't change the URL.
  // When the route changes, drop the override and follow the URL.
  const [manualSection, setManualSection] =
    React.useState<SidebarSectionId | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(true)

  React.useEffect(() => {
    setManualSection(null)
  }, [normalizedPathname])

  // Opening a top-level section always expands the detail panel.
  function handleSectionChange(section: SidebarSectionId) {
    setManualSection(section)
    setDetailOpen(true)
  }

  const activeSection = manualSection ?? routeSection

  return (
    <>
      <div className="relative z-50 flex h-full w-16 shrink-0">
        <IconNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <div
          className={cn(
            "absolute top-0 left-16 z-50 h-full",
            !detailOpen && "pointer-events-none"
          )}
        >
          <DetailSidebar
            activeSection={activeSection}
            pathname={normalizedPathname}
            isOpen={detailOpen}
            onClose={() => setDetailOpen(false)}
          />
        </div>
      </div>

      {detailOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 left-16 z-40 bg-background/45 backdrop-blur-sm transition-opacity"
          onClick={() => setDetailOpen(false)}
        />
      ) : null}
    </>
  )
}
