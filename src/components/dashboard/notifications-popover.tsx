"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  BellIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  selectUnreadCount,
  useNotificationsStore,
  type NotificationItem,
  type NotificationType,
} from "@/store/notifications-store"
import type { AppLanguage } from "@/store/language-store"
import type { DashboardCopy } from "@/lib/dashboard-i18n"

interface NotificationsPopoverProps {
  language: AppLanguage
  copy: DashboardCopy["header"]
}

const typeIcon: Record<NotificationType, typeof InformationCircleIcon> = {
  info: InformationCircleIcon,
  success: CheckmarkCircle02Icon,
  warning: Alert02Icon,
}

const typeTone: Record<NotificationType, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

function formatRelativeTime(
  iso: string,
  copy: DashboardCopy["header"]["notificationsPanel"]
) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60_000))

  if (minutes < 1) return copy.justNow
  if (minutes < 60) return copy.minutesAgo.replace("{n}", String(minutes))

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return copy.hoursAgo.replace("{n}", String(hours))

  const days = Math.floor(hours / 24)
  return copy.daysAgo.replace("{n}", String(days))
}

export function NotificationsPopover({
  language,
  copy,
}: NotificationsPopoverProps) {
  const items = useNotificationsStore((state) => state.items)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const remove = useNotificationsStore((state) => state.remove)
  const [open, setOpen] = React.useState(false)

  const unreadCount = selectUnreadCount(items)
  const sorted = React.useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [items]
  )

  function handleOpenItem(item: NotificationItem) {
    if (!item.read) markAsRead(item.id)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          aria-label={
            unreadCount > 0
              ? `${copy.notifications} (${unreadCount})`
              : copy.notifications
          }
          title={copy.notifications}
        >
          <HugeiconsIcon icon={BellIcon} size={17} strokeWidth={2} />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-1.5rem,22rem)] gap-0 p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {copy.notificationsPanel.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? copy.notificationsPanel.unread.replace(
                    "{n}",
                    String(unreadCount)
                  )
                : copy.notificationsPanel.allRead}
            </p>
          </div>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 text-xs"
              onClick={() => markAllAsRead()}
            >
              {copy.notificationsPanel.markAllRead}
            </Button>
          ) : null}
        </div>

        <div className="max-h-[min(60vh,22rem)] overflow-y-auto overscroll-contain">
          {sorted.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                {copy.notificationsPanel.emptyTitle}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.notificationsPanel.emptyDescription}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sorted.map((item) => {
                const icon = typeIcon[item.type]
                const title = item.title[language] ?? item.title.ru
                const description =
                  item.description[language] ?? item.description.ru

                const content = (
                  <>
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        typeTone[item.type]
                      )}
                    >
                      <HugeiconsIcon icon={icon} size={15} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            item.read
                              ? "font-medium text-foreground"
                              : "font-semibold text-foreground"
                          )}
                        >
                          {title}
                        </p>
                        {!item.read ? (
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {description}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">
                        {formatRelativeTime(
                          item.createdAt,
                          copy.notificationsPanel
                        )}
                      </p>
                    </div>
                  </>
                )

                return (
                  <li key={item.id} className="group relative">
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => {
                          handleOpenItem(item)
                          setOpen(false)
                        }}
                        className={cn(
                          "flex gap-2.5 px-3 py-2.5 pr-10 transition-colors hover:bg-muted/60",
                          !item.read && "bg-primary/[0.03]"
                        )}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenItem(item)}
                        className={cn(
                          "flex w-full gap-2.5 px-3 py-2.5 pr-10 text-left transition-colors hover:bg-muted/60",
                          !item.read && "bg-primary/[0.03]"
                        )}
                      >
                        {content}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="absolute top-2.5 right-2 flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label={copy.notificationsPanel.remove}
                      title={copy.notificationsPanel.remove}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={14}
                        strokeWidth={2}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
