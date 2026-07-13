"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  Search01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDashboardCopy, type DirectoryKind } from "@/lib/dashboard-i18n"
import {
  emptyEntityFromSchema,
  entityDisplayName,
  entityFieldValue,
  entityToRowValues,
  getDirectoryFormFields,
  getDirectoryTableFields,
} from "@/lib/directory-schema"
import { useLanguageStore } from "@/store/language-store"
import {
  getEntitiesForKind,
  makeEntityId,
  useDirectoriesStore,
  type DirectoryEntity,
} from "@/store/directories-store"
import { toast } from "@/store/toast-store"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

type ModalMode = "create" | "edit" | "delete" | null

function entityPrefix(kind: DirectoryKind) {
  switch (kind) {
    case "contractors":
      return "contractor"
    case "objects":
      return "object"
    case "services":
      return "service"
    case "events":
      return "event"
    case "sessions":
      return "session"
    case "service-categories":
      return "category"
    default:
      return "item"
  }
}

export function DirectoryPage({ kind }: { kind: DirectoryKind }) {
  const language = useLanguageStore((state) => state.language)
  const copy = getDashboardCopy(language).directories
  const pageCopy = copy.pages[kind]
  const contractors = useDirectoriesStore((state) => state.contractors)
  const objects = useDirectoriesStore((state) => state.objects)
  const services = useDirectoriesStore((state) => state.services)
  const events = useDirectoriesStore((state) => state.events)
  const sessions = useDirectoriesStore((state) => state.sessions)
  const categories = useDirectoriesStore((state) => state.categories)
  const upsertEntity = useDirectoriesStore((state) => state.upsertEntity)
  const removeEntity = useDirectoriesStore((state) => state.removeEntity)

  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [isBooting, setIsBooting] = React.useState(true)
  const [hasHydrated, setHasHydrated] = React.useState(false)
  const [modalMode, setModalMode] = React.useState<ModalMode>(null)
  const [activeItem, setActiveItem] = React.useState<DirectoryEntity | null>(
    null
  )
  const [draft, setDraft] = React.useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = React.useState(false)
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)

  const formFields = React.useMemo(() => getDirectoryFormFields(kind), [kind])
  const tableFields = React.useMemo(() => getDirectoryTableFields(kind), [kind])
  const fieldKeys = React.useMemo(
    () => formFields.map((field) => field.key),
    [formFields]
  )

  React.useEffect(() => {
    if (useDirectoriesStore.persist.hasHydrated()) {
      setHasHydrated(true)
      return
    }
    const unsub = useDirectoriesStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    return typeof unsub === "function" ? unsub : undefined
  }, [])

  React.useEffect(() => {
    setIsBooting(true)
    setQuery("")
    setPage(1)
    setPageSize(10)
    setModalMode(null)
    setActiveItem(null)
    const timer = window.setTimeout(() => setIsBooting(false), 280)
    return () => window.clearTimeout(timer)
  }, [kind])

  const entities = React.useMemo(
    () =>
      getEntitiesForKind(kind, {
        contractors,
        objects,
        services,
        events,
        sessions,
        categories,
      }),
    [kind, contractors, objects, services, events, sessions, categories]
  )

  const filtered = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return entities
    return entities.filter((item) =>
      entityToRowValues(kind, item).some((cell) =>
        cell.toLowerCase().includes(normalizedQuery)
      )
    )
  }, [entities, kind, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const showLoading = isBooting || !hasHydrated

  function openCreate() {
    const blank = emptyEntityFromSchema(kind, `${entityPrefix(kind)}-new`)
    const next: Record<string, string> = {}
    for (const key of fieldKeys) {
      next[key] = entityFieldValue(blank, key)
    }
    setActiveItem(blank)
    setDraft(next)
    setModalMode("create")
  }

  function openEdit(item: DirectoryEntity) {
    const next: Record<string, string> = {}
    for (const key of fieldKeys) {
      next[key] = entityFieldValue(item, key)
    }
    setActiveItem(item)
    setDraft(next)
    setModalMode("edit")
  }

  function openDelete(item: DirectoryEntity) {
    setActiveItem(item)
    setModalMode("delete")
  }

  function closeModal() {
    if (isSaving) return
    setModalMode(null)
    setActiveItem(null)
    setDraft({})
  }

  async function handleSave() {
    if (!activeItem || (modalMode !== "create" && modalMode !== "edit")) return
    const primaryName = (
      draft.nameRu?.trim() ||
      draft.name?.trim() ||
      ""
    ).trim()
    if (!primaryName) {
      toast({
        title: "Заполните наименование",
        variant: "error",
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 350))

    const id =
      modalMode === "create"
        ? makeEntityId(entityPrefix(kind), primaryName)
        : activeItem.id

    const payload = {
      id,
      ...Object.fromEntries(
        fieldKeys.map((key) => [key, (draft[key] ?? "").trim()])
      ),
    } as DirectoryEntity

    upsertEntity(kind, payload)
    setIsSaving(false)
    closeModal()
    toast({
      title: modalMode === "create" ? "Запись добавлена" : "Изменения сохранены",
      variant: "success",
    })
  }

  async function handleDelete() {
    if (!activeItem) return
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    removeEntity(kind, activeItem.id)
    setIsSaving(false)
    closeModal()
    toast({
      title: "Запись удалена",
      variant: "success",
    })
  }

  return (
    <main className="min-h-full bg-background">
      <div className="w-full animate-in px-4 py-6 duration-300 fade-in sm:px-5 lg:px-6 2xl:px-8">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative flex h-10 w-full max-w-xs shrink-0 items-center sm:max-w-[16rem]">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                strokeWidth={2}
                className="pointer-events-none absolute left-3 text-muted-foreground"
              />
              <Input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder={copy.common.search}
                className="h-10 bg-muted/50 pr-9 pl-9"
                disabled={showLoading}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setPage(1)
                  }}
                  className="absolute right-2 flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Очистить поиск"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
                </button>
              ) : null}
            </label>
            <Button
              type="button"
              className="h-10 w-full shrink-0 px-4 sm:ml-auto sm:w-auto"
              onClick={openCreate}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
              {pageCopy.addLabel}
            </Button>
          </div>

          {showLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table className="min-w-[760px] border-collapse">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    {tableFields.map((field) => (
                      <TableHead
                        key={field.key}
                        className="border-r border-border last:border-r-0"
                      >
                        {field.labels[language] ?? field.labels.ru}
                      </TableHead>
                    ))}
                    <TableHead className="w-14 border-r-0 text-right">
                      {copy.common.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleItems.map((item, rowIndex) => {
                    const row = entityToRowValues(kind, item)
                    return (
                      <TableRow
                        key={item.id}
                        className="animate-in fade-in duration-200"
                        style={{ animationDelay: `${rowIndex * 30}ms` }}
                      >
                        {row.map((cell, cellIndex) => (
                          <TableCell
                            key={`${item.id}-${cellIndex}`}
                            className="max-w-[220px] truncate border-r border-border last:border-r-0"
                          >
                            <span
                              className={
                                cellIndex === 0
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {cell}
                            </span>
                          </TableCell>
                        ))}
                        <TableCell className="w-14 border-r-0 text-right">
                          <Popover
                            open={menuOpenId === item.id}
                            onOpenChange={(open) =>
                              setMenuOpenId(open ? item.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                aria-label="Действия"
                              >
                                <HugeiconsIcon
                                  icon={MoreHorizontalIcon}
                                  size={18}
                                  strokeWidth={2}
                                />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              sideOffset={6}
                              className="w-44 p-1"
                            >
                              <button
                                type="button"
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                                  "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                                )}
                                onClick={() => {
                                  setMenuOpenId(null)
                                  openEdit(item)
                                }}
                              >
                                <HugeiconsIcon
                                  icon={PencilEdit01Icon}
                                  size={16}
                                  strokeWidth={2}
                                  className="text-muted-foreground"
                                />
                                Редактировать
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                                  "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
                                )}
                                onClick={() => {
                                  setMenuOpenId(null)
                                  openDelete(item)
                                }}
                              >
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  size={16}
                                  strokeWidth={2}
                                />
                                Удалить
                              </button>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {visibleItems.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={tableFields.length + 1}
                        className="p-0 text-center whitespace-normal"
                      >
                        <EmptyState
                          icon={
                            <HugeiconsIcon
                              icon={Folder01Icon}
                              size={22}
                              strokeWidth={2}
                            />
                          }
                          title={
                            query ? copy.common.empty : "Пока нет записей"
                          }
                          description={
                            query
                              ? "Попробуйте изменить запрос."
                              : "Добавьте запись кнопкой сверху или заполните шаг онбординга."
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setPage(1)
                  }}
                >
                  <SelectTrigger
                    className="h-10 min-w-16 gap-1.5 border-border bg-background px-2.5 shadow-none hover:bg-muted hover:text-foreground data-[size=default]:h-10 data-[size=sm]:h-10 dark:bg-background dark:hover:bg-muted"
                    aria-label="Количество записей на странице"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-16">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={currentPage === 1}
                    aria-label={copy.common.previous}
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  </Button>
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-sm tabular-nums text-muted-foreground">
                    {currentPage}/{pageCount}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() =>
                      setPage((current) => Math.min(pageCount, current + 1))
                    }
                    disabled={currentPage === pageCount}
                    aria-label={copy.common.next}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <Dialog
        open={modalMode === "create" || modalMode === "edit"}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
      >
        <DialogContent className="flex max-h-[min(92dvh,820px)] w-[min(calc(100dvw-1.5rem),640px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogHeader className="space-y-2 border-b border-border px-6 py-5 pr-14 sm:px-8">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {modalMode === "create" ? pageCopy.addLabel : "Редактировать"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {modalMode === "create"
                ? "Заполните поля и сохраните запись в справочнике."
                : "Измените данные и сохраните."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {formFields.map((field, index) => {
                const wide =
                  field.key.includes("description") ||
                  field.key.includes("Address") ||
                  field.key.includes("address") ||
                  (formFields.length % 2 === 1 &&
                    index === formFields.length - 1)
                return (
                  <div
                    key={field.key}
                    className={wide ? "space-y-2.5 sm:col-span-2" : "space-y-2.5"}
                  >
                    <Label htmlFor={`dir-field-${field.key}`}>
                      {field.labels[language] ?? field.labels.ru}
                      {field.required ? " *" : ""}
                    </Label>
                    <Input
                      id={`dir-field-${field.key}`}
                      className="h-11"
                      value={draft[field.key] ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      disabled={isSaving}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={closeModal}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="h-11 min-w-36 px-6"
              loading={isSaving}
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalMode === "delete"}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
          <DialogHeader className="space-y-2 border-b border-border px-6 py-5 pr-14">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Удалить запись?
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {activeItem
                ? `«${entityDisplayName(kind, activeItem)}» будет удалена из справочника. Действие нельзя отменить.`
                : "Запись будет удалена из справочника."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={closeModal}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11 min-w-36 px-6"
              loading={isSaving}
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
