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
import {
  buildGuideSteps,
  getTourStage,
  t,
  TOUR_WELCOME,
  type TourStageId,
} from "@/lib/tour-config"
import { tourDelay, TOUR_TIMING } from "@/lib/tour-timing"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguageStore } from "@/store/language-store"
import {
  getEntitiesForKind,
  makeEntityId,
  useDirectoriesStore,
  type DirectoryEntity,
} from "@/store/directories-store"
import { useTourStore } from "@/store/tour-store"
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
  const isMobile = useIsMobile()

  const tourActive = useTourStore((state) => state.active)
  const tourMode = useTourStore((state) => state.uiMode)
  const tourStage = useTourStore((state) => state.currentStage)
  const guideIndex = useTourStore((state) => state.guideIndex)
  const advanceGuide = useTourStore((state) => state.advanceGuide)
  const setGuideIndex = useTourStore((state) => state.setGuideIndex)
  const completeCurrentStage = useTourStore((state) => state.completeCurrentStage)
  const fieldAdvanceTimerRef = React.useRef<number | null>(null)

  const formFields = React.useMemo(() => getDirectoryFormFields(kind), [kind])
  const tableFields = React.useMemo(() => getDirectoryTableFields(kind), [kind])
  const fieldKeys = React.useMemo(
    () => formFields.map((field) => field.key),
    [formFields]
  )

  // Only after intro "Продолжить" — never while stage-intro modal is open.
  const isTourGuiding =
    tourActive && tourStage === kind && tourMode === "coachmark"

  const guideSteps = React.useMemo(() => {
    const stage = getTourStage(kind as TourStageId)
    return stage ? buildGuideSteps(stage) : []
  }, [kind])

  const currentGuide = isTourGuiding ? guideSteps[guideIndex] ?? null : null

  // Focus the guided control only while actively coaching (after intro).
  React.useEffect(() => {
    if (!isTourGuiding || !currentGuide) return

    const timer = window.setTimeout(() => {
      if (currentGuide.kind === "add" && modalMode === null) {
        document
          .querySelector<HTMLButtonElement>(`[data-tour="directory-add"]`)
          ?.focus({ preventScroll: true })
        return
      }
      if (currentGuide.kind === "field" && modalMode === "create") {
        const root = document.querySelector<HTMLElement>(
          `[data-tour="directory-field-${currentGuide.fieldKey}"]`
        )
        const input = root?.querySelector<HTMLElement>("input, textarea, select")
        input?.focus({ preventScroll: true })
        return
      }
      if (currentGuide.kind === "save" && modalMode === "create") {
        document
          .querySelector<HTMLButtonElement>(`[data-tour="directory-save"]`)
          ?.focus({ preventScroll: true })
      }
    }, tourDelay(280))

    return () => window.clearTimeout(timer)
  }, [
    isTourGuiding,
    guideIndex,
    currentGuide?.kind,
    currentGuide?.fieldKey,
    modalMode,
  ])

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
    setQuery("")
    setPage(1)
    setPageSize(10)
    setModalMode(null)
    setActiveItem(null)
    setMenuOpenId(null)
    // Short boot only if store not ready — avoid 280ms flash on every hop.
    if (useDirectoriesStore.persist.hasHydrated()) {
      setIsBooting(false)
      setHasHydrated(true)
      return
    }
    setIsBooting(true)
    const timer = window.setTimeout(() => setIsBooting(false), 120)
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

  React.useEffect(() => {
    return () => {
      if (fieldAdvanceTimerRef.current) {
        window.clearTimeout(fieldAdvanceTimerRef.current)
      }
    }
  }, [])

  function tryAdvanceFieldGuide(fieldKey: string, value: string) {
    if (
      !isTourGuiding ||
      currentGuide?.kind !== "field" ||
      currentGuide.fieldKey !== fieldKey ||
      !value.trim()
    ) {
      return
    }

    if (fieldAdvanceTimerRef.current) {
      window.clearTimeout(fieldAdvanceTimerRef.current)
    }

    fieldAdvanceTimerRef.current = window.setTimeout(() => {
      const state = useTourStore.getState()
      if (
        state.currentStage !== kind ||
        state.uiMode !== "coachmark"
      ) {
        return
      }
      const step = guideSteps[state.guideIndex]
      if (step?.kind === "field" && step.fieldKey === fieldKey) {
        advanceGuide()
      }
    }, tourDelay(TOUR_TIMING.fieldAdvanceMs))
  }

  function openCreate() {
    const blank = emptyEntityFromSchema(kind, `${entityPrefix(kind)}-new`)
    const next: Record<string, string> = {}
    for (const key of fieldKeys) {
      next[key] = entityFieldValue(blank, key)
    }
    setActiveItem(blank)
    setDraft(next)
    setModalMode("create")

    // Wait for create dialog open animation before moving spotlight to fields.
    if (isTourGuiding && (currentGuide?.kind === "add" || tourMode === "coachmark")) {
      window.setTimeout(() => {
        if (useTourStore.getState().currentStage !== kind) return
        if (currentGuide?.kind === "add") {
          advanceGuide()
          return
        }
        const firstFieldIndex = guideSteps.findIndex(
          (step) => step.kind === "field"
        )
        if (firstFieldIndex >= 0) setGuideIndex(firstFieldIndex)
      }, tourDelay(TOUR_TIMING.afterModalMs))
    }
  }

  function handleTourFieldChange(fieldKey: string, value: string) {
    setDraft((current) => ({ ...current, [fieldKey]: value }))
    // Only after the field stays filled for fieldAdvanceMs (2s).
    tryAdvanceFieldGuide(fieldKey, value)
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

  function closeModal(options?: { preserveTourGuide?: boolean }) {
    if (isSaving) return
    setModalMode(null)
    setActiveItem(null)
    setDraft({})
    // Tour: if form closed mid-guide, return spotlight to Add button.
    if (
      !options?.preserveTourGuide &&
      isTourGuiding &&
      tourMode === "coachmark" &&
      guideIndex > 0
    ) {
      setGuideIndex(0)
    }
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
    await new Promise((resolve) =>
      setTimeout(resolve, tourDelay(420))
    )

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

    const wasCreate = modalMode === "create"
    const tourCompleting =
      wasCreate &&
      tourActive &&
      tourStage === kind &&
      tourMode === "coachmark"
    upsertEntity(kind, payload)
    setIsSaving(false)
    // Close after a short beat so success doesn't feel abrupt.
    await new Promise((resolve) => setTimeout(resolve, tourDelay(180)))
    closeModal({ preserveTourGuide: tourCompleting })

    // Minimal toasts: skip mid-tour noise.
    if (!tourCompleting) {
      toast({
        title: wasCreate ? copy.common.added : copy.common.saved,
        variant: "success",
      })
    }

    // Tour: stage done → guide menu clicks (user navigates; no auto-open).
    if (tourCompleting) {
      window.setTimeout(() => {
        const result = completeCurrentStage()
        if (result?.finished) {
          toast({
            title: t(TOUR_WELCOME.completedTitle, language),
            description: t(TOUR_WELCOME.completedDescription, language),
            variant: "success",
          })
        }
      }, tourDelay(TOUR_TIMING.afterModalMs))
    }
  }

  async function handleDelete() {
    if (!activeItem) return
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    removeEntity(kind, activeItem.id)
    setIsSaving(false)
    closeModal()
    toast({
      title: copy.common.deleted,
      variant: "success",
    })
  }

  function RowActions({ item }: { item: DirectoryEntity }) {
    const open = menuOpenId === item.id
    return (
      <Popover
        open={open}
        onOpenChange={(next) => setMenuOpenId(next ? item.id : null)}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors",
              "hover:bg-primary/10 hover:text-foreground",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
              open && "bg-muted text-foreground"
            )}
            aria-label={copy.common.actions}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={18}
              strokeWidth={2}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="z-[120] w-44 p-1"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors",
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
            {copy.common.edit}
          </button>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors",
              "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
            )}
            onClick={() => {
              setMenuOpenId(null)
              openDelete(item)
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={2} />
            {copy.common.delete}
          </button>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <main className="min-h-full bg-background">
      <div className="flex w-full flex-col gap-4 px-4 py-6 sm:px-5 lg:px-6 2xl:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex h-10 w-full max-w-full shrink-0 items-center sm:max-w-[16rem]">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder={copy.common.search}
              className="h-10 border-border bg-background pr-9 pl-9"
              disabled={showLoading}
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setPage(1)
                }}
                className="absolute right-2 flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={copy.common.clearSearch}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              </button>
            ) : null}
          </label>
          <Button
            type="button"
            data-tour="directory-add"
            className={cn(
              "h-10 w-full shrink-0 px-4 sm:ml-auto sm:w-auto",
              isTourGuiding && currentGuide?.kind === "add" && "relative z-[90]"
            )}
            onClick={openCreate}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
            {pageCopy.addLabel}
          </Button>
        </div>

        <section className="overflow-hidden rounded-md border border-border bg-card">
          {showLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 flex-1 rounded-md" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/*
                Render ONE list only — dual mobile+desktop RowActions with the same
                controlled open id broke the actions popover (two roots fighting).
              */}
              {isMobile ? (
                <div className="divide-y divide-border">
                  {visibleItems.length === 0 ? (
                    <EmptyState
                      icon={
                        <HugeiconsIcon
                          icon={Folder01Icon}
                          size={22}
                          strokeWidth={2}
                        />
                      }
                      title={
                        query ? copy.common.empty : copy.common.emptyTitle
                      }
                      description={
                        query
                          ? copy.common.emptySearchHint
                          : copy.common.emptyDescription
                      }
                    />
                  ) : (
                    visibleItems.map((item) => {
                      const row = entityToRowValues(kind, item)
                      return (
                        <article
                          key={item.id}
                          className="flex items-start gap-3 p-4"
                        >
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {row[0] || entityDisplayName(kind, item)}
                            </p>
                            <dl className="grid gap-1.5">
                              {tableFields.slice(1, 4).map((field, index) => {
                                const value = row[index + 1]
                                if (!value) return null
                                return (
                                  <div
                                    key={field.key}
                                    className="flex min-w-0 gap-2 text-xs"
                                  >
                                    <dt className="shrink-0 text-muted-foreground">
                                      {field.labels[language] ?? field.labels.ru}:
                                    </dt>
                                    <dd className="min-w-0 truncate text-foreground">
                                      {value}
                                    </dd>
                                  </div>
                                )
                              })}
                            </dl>
                          </div>
                          <RowActions item={item} />
                        </article>
                      )
                    })
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[720px] border-collapse">
                    <TableHeader>
                      <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                        {tableFields.map((field) => (
                          <TableHead
                            key={field.key}
                            className="border-r border-border text-xs font-bold tracking-wide text-foreground uppercase last:border-r-0"
                          >
                            {field.labels[language] ?? field.labels.ru}
                          </TableHead>
                        ))}
                        <TableHead className="w-14 border-r-0 text-right text-xs font-bold tracking-wide text-foreground uppercase">
                          {copy.common.actions}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-background">
                      {visibleItems.map((item) => {
                        const row = entityToRowValues(kind, item)
                        return (
                          <TableRow
                            key={item.id}
                            className="border-border hover:bg-muted/30"
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
                              <RowActions item={item} />
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
                                query
                                  ? copy.common.empty
                                  : copy.common.emptyTitle
                              }
                              description={
                                query
                                  ? copy.common.emptySearchHint
                                  : copy.common.emptyDescription
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 p-3">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setPage(1)
                  }}
                >
                  <SelectTrigger
                    className="h-10 min-w-16 gap-1.5 border-border bg-background px-2.5 shadow-none data-[size=default]:h-10 data-[size=sm]:h-10"
                    aria-label={copy.common.pageSize}
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
                    className="size-10 border-border"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={currentPage === 1}
                    aria-label={copy.common.previous}
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  </Button>
                  <div className="flex h-10 min-w-10 items-center justify-center rounded-md border border-border bg-background px-2 text-sm tabular-nums text-muted-foreground">
                    {currentPage}/{pageCount}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 border-border"
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
        <DialogContent className="flex max-h-[min(92dvh,860px)] w-[min(calc(100dvw-1.5rem),720px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogHeader className="space-y-2.5 border-b border-border px-5 py-5 pr-14 sm:px-10 sm:py-7">
            <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              {modalMode === "create" ? pageCopy.addLabel : copy.common.editTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {modalMode === "create"
                ? copy.common.createDescription
                : copy.common.editDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
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
                    <div
                      data-tour={`directory-field-${field.key}`}
                      className="rounded-lg border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
                    >
                      <Input
                        id={`dir-field-${field.key}`}
                        className="h-11 border-0 bg-transparent text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0"
                        value={draft[field.key] ?? ""}
                        onChange={(event) =>
                          handleTourFieldChange(field.key, event.target.value)
                        }
                        placeholder={
                          field.placeholders[language] ?? field.placeholders.ru
                        }
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-5 py-5 sm:flex-row sm:justify-end sm:px-10 sm:py-7">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={() => closeModal()}
              disabled={isSaving}
            >
              {copy.common.cancel}
            </Button>
            <Button
              type="button"
              data-tour="directory-save"
              className={cn(
                "h-11 min-w-36 px-6",
                isTourGuiding && currentGuide?.kind === "save" && "relative z-[90]"
              )}
              loading={isSaving}
              onClick={handleSave}
            >
              {copy.common.save}
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
              {copy.common.deleteTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {activeItem
                ? copy.common.deleteDescriptionNamed.replace(
                    "{name}",
                    entityDisplayName(kind, activeItem)
                  )
                : copy.common.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={() => closeModal()}
              disabled={isSaving}
            >
              {copy.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11 min-w-36 px-6"
              loading={isSaving}
              onClick={handleDelete}
            >
              {copy.common.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
