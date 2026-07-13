"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  CircleQuestionMarkIcon,
  Clock01Icon,
  Rocket01Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { getDashboardCopy } from "@/lib/dashboard-i18n"
import { cn } from "@/lib/utils"
import type {
  OnboardingCopy,
  OnboardingFieldCopy,
  OnboardingOptionsFrom,
  OnboardingStepCopy,
} from "@/lib/dashboard-i18n"
import { useLanguageStore } from "@/store/language-store"
import {
  isOnboardingComplete,
  onboardingStepIds,
  useOnboardingStore,
} from "@/store/onboarding-store"
import { useRegisterStore } from "@/store/register-store"
import {
  getFirstIncompleteStep,
  seedOnboardingFromRegister,
  syncOnboardingStepToDirectories,
} from "@/lib/onboarding-sync"
import { toast } from "@/store/toast-store"

type DraftValue = string | boolean | string[]

/** Unified height/width for all onboarding inputs and selectors. */
const fieldControlClassName =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent text-sm shadow-none data-[size=default]:h-10 data-[size=sm]:h-10"

const optionsFromDraftKey: Record<OnboardingOptionsFrom, string> = {
  contractor: "contractorName",
  object: "objectName",
  service: "serviceName",
  event: "eventName",
}

function fieldValue(value: DraftValue | undefined) {
  return typeof value === "string" ? value : ""
}

function fieldArray(value: DraftValue | undefined) {
  return Array.isArray(value) ? value : []
}

function getOrderedSteps(copy: OnboardingCopy) {
  return onboardingStepIds
    .map((stepId) => copy.steps.find((step) => step.id === stepId))
    .filter((step): step is OnboardingStepCopy => Boolean(step))
}

function getLinkedOptions(
  source: OnboardingOptionsFrom | undefined,
  drafts: Record<string, DraftValue>
) {
  if (!source) return []
  const raw = drafts[optionsFromDraftKey[source]]
  if (typeof raw !== "string") return []
  const value = raw.trim()
  return value ? [value] : []
}

function resolveFieldOptions(
  field: OnboardingFieldCopy,
  copy: OnboardingCopy,
  drafts: Record<string, DraftValue>
) {
  if (field.optionsFrom) {
    return getLinkedOptions(field.optionsFrom, drafts)
  }
  if (field.optionsKey) {
    return copy.options[field.optionsKey] ?? []
  }
  return []
}

function FileDropzone({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  const inputId = React.useId()
  const [isDragging, setIsDragging] = React.useState(false)

  function handleFile(file: File | undefined) {
    if (file) onChange(file.name)
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFile(event.dataTransfer.files[0])
      }}
      className={cn(
        "flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-center transition-colors",
        "hover:border-primary/60 hover:bg-primary/5",
        isDragging && "border-primary bg-primary/10"
      )}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <span className="flex size-10 items-center justify-center rounded-lg bg-background text-primary">
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
      </span>
      <span className="mt-3 text-sm font-medium text-foreground">
        {value || placeholder || "Выберите файл"}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">
        Перетащите изображение сюда или нажмите для выбора
      </span>
    </label>
  )
}

const TIME_HOURS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0")
)
const TIME_MINUTES = ["00", "15", "30", "45"]
const TIME_QUICK = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "18:00",
  "19:00",
  "20:00",
]

function formatTimeValue(hour: string, minute: string) {
  return `${hour}:${minute}`
}

function parseTimeValue(value: string) {
  const [hour = "10", minute = "00"] = value.split(":")
  return {
    hour: TIME_HOURS.includes(hour) ? hour : "10",
    minute: TIME_MINUTES.includes(minute) ? minute : "00",
  }
}

function sortTimes(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function TimeListControl({
  times,
  onChange,
  copy,
}: {
  times: string[]
  onChange: (value: string[]) => void
  copy: OnboardingCopy
}) {
  const [open, setOpen] = React.useState(false)
  const [hour, setHour] = React.useState("10")
  const [minute, setMinute] = React.useState("00")
  const draft = formatTimeValue(hour, minute)
  const alreadyAdded = times.includes(draft)

  function addTime(value: string) {
    if (!value || times.includes(value)) return
    onChange(sortTimes([...times, value]))
  }

  function removeTime(value: string) {
    onChange(times.filter((item) => item !== value))
  }

  function handleAddDraft() {
    if (alreadyAdded) return
    addTime(draft)
    setOpen(false)
  }

  return (
    <div className="space-y-3.5">
      <div className="flex gap-2.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                fieldControlClassName,
                "flex items-center justify-between gap-2 px-2.5 text-left transition-colors outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "dark:bg-input/30 dark:hover:bg-input/50"
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-muted-foreground"
                />
                <span className="truncate tabular-nums text-foreground">
                  {draft}
                </span>
              </span>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                size={16}
                strokeWidth={2}
                className="shrink-0 text-muted-foreground"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="z-[220] w-[min(100vw-2rem,320px)] p-3"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {copy.timeQuick}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_QUICK.map((item) => {
                    const selected = times.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          const parsed = parseTimeValue(item)
                          setHour(parsed.hour)
                          setMinute(parsed.minute)
                          if (!selected) addTime(item)
                        }}
                        className={cn(
                          "h-8 rounded-md border px-2.5 text-xs font-medium tabular-nums transition-colors",
                          selected
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {copy.timeHour}
                  </p>
                  <div className="h-40 overflow-y-auto rounded-lg border border-border p-1">
                    {TIME_HOURS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setHour(item)}
                        className={cn(
                          "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                          hour === item
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {copy.timeMinute}
                  </p>
                  <div className="h-40 overflow-y-auto rounded-lg border border-border p-1">
                    {TIME_MINUTES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setMinute(item)}
                        className={cn(
                          "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                          minute === item
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {draft}
                </span>
                <Button
                  type="button"
                  className="h-9"
                  disabled={alreadyAdded}
                  onClick={handleAddDraft}
                >
                  {alreadyAdded ? copy.timeAlreadyAdded : copy.addTime}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 px-4"
          disabled={alreadyAdded}
          onClick={handleAddDraft}
        >
          {copy.addTime}
        </Button>
      </div>

      {times.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {times.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => removeTime(item)}
              title={copy.removeTime}
              aria-label={`${copy.removeTime}: ${item}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 text-sm font-medium tabular-nums text-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <HugeiconsIcon
                icon={Clock01Icon}
                size={14}
                strokeWidth={2}
                className="opacity-70"
              />
              {item}
              <span aria-hidden className="text-muted-foreground">
                ×
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{copy.timePlaceholder}</p>
      )}
    </div>
  )
}

function LinkedEmptyState({ message }: { message: string }) {
  return (
    <div
      className={cn(
        fieldControlClassName,
        "flex items-center border-dashed bg-muted/20 px-2.5 text-sm text-muted-foreground"
      )}
      title={message}
    >
      <span className="truncate">{message}</span>
    </div>
  )
}

function LinkedSelect({
  fieldName,
  value,
  options,
  placeholder,
}: {
  fieldName: string
  value: string
  options: string[]
  placeholder: string
}) {
  const updateDraft = useOnboardingStore((state) => state.updateDraft)
  const optionsKey = options.join("\u0001")
  const autoFilledRef = React.useRef<string | null>(null)

  // Fill once when a single linked option appears — never on every render.
  React.useEffect(() => {
    if (options.length !== 1) return
    const only = options[0]
    if (!only) return
    if (value === only) {
      autoFilledRef.current = `${fieldName}:${only}`
      return
    }
    if (value && options.includes(value)) return
    const token = `${fieldName}:${only}`
    if (autoFilledRef.current === token) return
    autoFilledRef.current = token
    updateDraft(fieldName, only)
  }, [fieldName, options, optionsKey, updateDraft, value])

  const selectValue =
    value && options.includes(value)
      ? value
      : options.length === 1
        ? options[0]
        : undefined

  return (
    <Select
      value={selectValue}
      onValueChange={(nextValue) => updateDraft(fieldName, nextValue)}
    >
      <SelectTrigger className={cn(fieldControlClassName, "justify-between px-2.5")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="z-[200] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
      >
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function MultiSelect({
  options,
  selected,
  placeholder,
  clearLabel,
  onChange,
}: {
  options: string[]
  selected: string[]
  placeholder: string
  clearLabel: string
  onChange: (value: string[]) => void
}) {
  const [open, setOpen] = React.useState(false)
  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected[0]} +${selected.length - 1}`

  function toggleOption(option: string) {
    const checked = selected.includes(option)
    onChange(
      checked
        ? selected.filter((item) => item !== option)
        : [...selected, option]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            fieldControlClassName,
            "flex items-center justify-between gap-1.5 px-2.5 text-left transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "dark:bg-input/30 dark:hover:bg-input/50",
            selected.length === 0 && "text-muted-foreground"
          )}
          aria-expanded={open}
        >
          <span className="min-w-0 flex-1 truncate">{summary}</span>
          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            strokeWidth={2}
            className="size-4 shrink-0 text-muted-foreground"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[200] w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="max-h-60 overflow-y-auto">
          {options.map((option) => {
            const checked = selected.includes(option)
            return (
              <div
                key={option}
                role="option"
                aria-selected={checked}
                onClick={() => toggleOption(option)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  checked && "bg-accent/60"
                )}
              >
                <Checkbox
                  checked={checked}
                  tabIndex={-1}
                  className="pointer-events-none"
                />
                <span className="min-w-0 flex-1 truncate">{option}</span>
              </div>
            )
          })}
        </div>
        {selected.length > 0 ? (
          <div className="mt-1 border-t border-border p-1">
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex h-8 w-full items-center justify-center rounded-md text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {clearLabel}
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function LinkedMultiSelect({
  fieldName,
  options,
  selected,
  placeholder,
  clearLabel,
  autoSelectSingle,
}: {
  fieldName: string
  options: string[]
  selected: string[]
  placeholder: string
  clearLabel: string
  autoSelectSingle?: boolean
}) {
  const updateDraft = useOnboardingStore((state) => state.updateDraft)
  const optionsKey = options.join("\u0001")
  const normalized = React.useMemo(
    () => selected.filter((item) => options.includes(item)),
    [options, selected]
  )
  const autoFilledRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!autoSelectSingle || options.length !== 1) return
    if (normalized.length > 0) return
    const token = `${fieldName}:${optionsKey}`
    if (autoFilledRef.current === token) return
    autoFilledRef.current = token
    updateDraft(fieldName, options)
  }, [
    autoSelectSingle,
    fieldName,
    normalized.length,
    options,
    optionsKey,
    updateDraft,
  ])

  return (
    <MultiSelect
      options={options}
      selected={normalized}
      placeholder={placeholder}
      clearLabel={clearLabel}
      onChange={(nextValue) => updateDraft(fieldName, nextValue)}
    />
  )
}

function FieldControl({
  field,
  copy,
}: {
  field: OnboardingFieldCopy
  copy: OnboardingCopy
}) {
  const drafts = useOnboardingStore((state) => state.drafts)
  const updateDraft = useOnboardingStore((state) => state.updateDraft)
  const value = drafts[field.name]
  const options = resolveFieldOptions(field, copy, drafts)
  const emptyHint = field.emptyHint ?? copy.emptyLinkHint

  if (field.type === "textarea") {
    return (
      <textarea
        value={fieldValue(value)}
        onChange={(event) => updateDraft(field.name, event.target.value)}
        placeholder={field.placeholder}
        className="min-h-24 w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
    )
  }

  if (field.type === "select") {
    if (options.length === 0) {
      return <LinkedEmptyState message={emptyHint} />
    }

    return (
      <LinkedSelect
        fieldName={field.name}
        value={fieldValue(value)}
        options={options}
        placeholder={field.placeholder ?? copy.selectPlaceholder}
      />
    )
  }

  if (field.type === "checkbox") {
    const checked = Boolean(value)

    return (
      <label className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-2 text-left text-sm transition-colors hover:bg-muted/50">
        <Checkbox
          checked={checked}
          onCheckedChange={(next) => updateDraft(field.name, next === true)}
        />
        <span>{field.label}</span>
      </label>
    )
  }

  if (field.type === "checkboxGroup") {
    if (options.length === 0) {
      return <LinkedEmptyState message={emptyHint} />
    }

    return (
      <LinkedMultiSelect
        fieldName={field.name}
        options={options}
        selected={fieldArray(value)}
        placeholder={field.placeholder ?? copy.multiSelectPlaceholder}
        clearLabel={copy.clearSelection}
        autoSelectSingle={Boolean(field.optionsFrom)}
      />
    )
  }

  if (field.type === "timeList") {
    return (
      <TimeListControl
        times={fieldArray(value)}
        onChange={(nextValue) => updateDraft(field.name, nextValue)}
        copy={copy}
      />
    )
  }

  if (field.type === "date") {
    return (
      <DatePicker
        value={fieldValue(value)}
        onChange={(nextValue) => updateDraft(field.name, nextValue)}
        placeholder={field.placeholder ?? copy.selectPlaceholder}
        className={cn(
          fieldControlClassName,
          "justify-start px-2.5 text-left font-normal data-[empty=true]:text-muted-foreground"
        )}
      />
    )
  }

  if (field.type === "file") {
    return (
      <FileDropzone
        value={fieldValue(value)}
        placeholder={field.placeholder}
        onChange={(nextValue) => updateDraft(field.name, nextValue)}
      />
    )
  }

  return (
    <Input
      type={field.type}
      value={fieldValue(value)}
      onChange={(event) => updateDraft(field.name, event.target.value)}
      placeholder={field.placeholder}
      className={cn(fieldControlClassName, "px-2.5")}
    />
  )
}

function OnboardingField({
  field,
  copy,
}: {
  field: OnboardingFieldCopy
  copy: OnboardingCopy
}) {
  if (field.type === "checkbox") {
    return <FieldControl field={field} copy={copy} />
  }

  const wide =
    field.type === "textarea" ||
    field.type === "file" ||
    field.type === "timeList"

  return (
    <div className={wide ? "space-y-2.5 sm:col-span-2" : "space-y-2.5"}>
      <Label className="text-sm">
        {field.label}
        {field.required ? <span className="ml-1 text-primary">*</span> : null}
      </Label>
      <FieldControl field={field} copy={copy} />
      {field.help ? (
        <p className="text-xs leading-5 text-muted-foreground">{field.help}</p>
      ) : null}
    </div>
  )
}

function HelpTip({
  title,
  text,
  label = "Подсказка",
}: {
  title: string
  text: string
  label?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          aria-label={label}
        >
          <HugeiconsIcon
            icon={CircleQuestionMarkIcon}
            size={16}
            strokeWidth={2}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="z-[220] w-80 max-w-[calc(100vw-2rem)] p-3"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
      </PopoverContent>
    </Popover>
  )
}

function StepNavigation({
  copy,
  currentStep,
  disabled = false,
}: {
  copy: OnboardingCopy
  currentStep: OnboardingStepCopy
  disabled?: boolean
}) {
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep)
  const completedStepIds = useOnboardingStore((state) => state.completedStepIds)
  const orderedSteps = getOrderedSteps(copy)
  const firstIncomplete = getFirstIncompleteStep(completedStepIds)
  const firstIncompleteIndex = onboardingStepIds.indexOf(firstIncomplete)

  return (
    <nav
      aria-label={copy.sidebarTitle}
      className={cn("w-full", disabled && "pointer-events-none opacity-70")}
    >
      <ol className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {orderedSteps.map((step, index) => {
          const isActive = step.id === currentStep.id
          const isDone = completedStepIds.includes(step.id)
          const tip = copy.helpers[step.id]
          // Only completed steps + first incomplete are reachable.
          const isReachable = isDone || index <= firstIncompleteIndex

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "flex w-full min-w-0 items-center gap-1.5 rounded-lg border px-2 py-2 transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : isDone
                      ? "border-border bg-muted/40 text-foreground"
                      : "border-transparent bg-muted/20 text-muted-foreground",
                  !isReachable && "opacity-50"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isReachable) return
                    setCurrentStep(step.id)
                  }}
                  title={
                    isReachable
                      ? step.shortTitle
                      : "Сначала заполните предыдущие шаги"
                  }
                  disabled={disabled || !isReachable}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left outline-none",
                    "focus-visible:ring-3 focus-visible:ring-ring/50",
                    "disabled:cursor-not-allowed",
                    !isActive && !isDone && isReachable && "hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                          ? "bg-primary/15 text-primary"
                          : "bg-background text-muted-foreground ring-1 ring-border"
                    )}
                  >
                    {isDone && !isActive ? (
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        size={14}
                        strokeWidth={2}
                      />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden min-w-0 truncate text-xs font-medium sm:block">
                    {step.shortTitle}
                  </span>
                </button>
                {tip ? (
                  <HelpTip title={step.shortTitle} text={tip} />
                ) : null}
              </div>
              {index < orderedSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="hidden h-px w-2 shrink-0 bg-border sm:block"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function OnboardingDialog({
  open,
  onOpenChange,
  copy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  copy: OnboardingCopy
}) {
  const currentStepId = useOnboardingStore((state) => state.currentStep)
  const completedStepIds = useOnboardingStore((state) => state.completedStepIds)
  const drafts = useOnboardingStore((state) => state.drafts)
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete)
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep)
  const updateDraft = useOnboardingStore((state) => state.updateDraft)
  const [showIntro, setShowIntro] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const currentIndex = Math.max(0, onboardingStepIds.indexOf(currentStepId))
  const currentStep =
    copy.steps.find((step) => step.id === currentStepId) ??
    copy.steps.find((step) => step.id === onboardingStepIds[0]) ??
    copy.steps[0]
  const hasDrafts = Object.values(drafts).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  )
  const onboardingComplete = isOnboardingComplete(completedStepIds)
  const hasOnboardingProgress =
    !onboardingComplete && (completedStepIds.length > 0 || hasDrafts)

  // Always open incomplete flow on the first unfinished step (not mid-chain).
  React.useEffect(() => {
    if (!open || onboardingComplete) return
    const firstIncomplete = getFirstIncompleteStep(completedStepIds)
    const firstIdx = onboardingStepIds.indexOf(firstIncomplete)
    const currentIdx = onboardingStepIds.indexOf(currentStepId)
    if (currentIdx > firstIdx || currentIdx < 0) {
      setCurrentStep(firstIncomplete)
    }
  }, [
    open,
    onboardingComplete,
    completedStepIds,
    currentStepId,
    setCurrentStep,
  ])

  function startOnboarding() {
    if (!onboardingComplete) {
      setCurrentStep(getFirstIncompleteStep(completedStepIds))
    }
    setShowIntro(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setShowIntro(true)
      setIsSaving(false)
    }
    onOpenChange(nextOpen)
  }

  async function saveAndContinue() {
    if (isSaving) return
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 420))

    const nextDrafts = { ...drafts }

    if (currentStep.id === "contractors") {
      const name = fieldValue(drafts.contractorName).trim()
      if (name) {
        updateDraft("contractor", name)
        nextDrafts.contractor = name
      }
    }
    if (currentStep.id === "object") {
      const name = fieldValue(drafts.objectName).trim()
      if (name) {
        updateDraft("eventObject", name)
        nextDrafts.eventObject = name
      }
    }
    if (currentStep.id === "services") {
      const name = fieldValue(drafts.serviceName).trim()
      if (name) {
        updateDraft("eventServices", [name])
        nextDrafts.eventServices = [name]
      }
    }
    if (currentStep.id === "events") {
      const name = fieldValue(drafts.eventName).trim()
      if (name) {
        updateDraft("eventTemplate", name)
        nextDrafts.eventTemplate = name
      }
    }

    markStepComplete(currentStep.id)
    syncOnboardingStepToDirectories(currentStep.id, nextDrafts)

    const nextStep = onboardingStepIds[currentIndex + 1]
    if (nextStep) {
      setCurrentStep(nextStep)
      toast({
        title: "Шаг сохранён",
        description: `${currentStep.shortTitle} — данные в справочнике`,
        variant: "success",
        duration: 2200,
      })
      setIsSaving(false)
    } else {
      setIsSaving(false)
      handleOpenChange(false)
      toast({
        title: "Онбординг завершён",
        description: "Данные сохранены и синхронизированы со справочниками.",
        variant: "success",
      })
    }
  }

  const introEyebrow = onboardingComplete
    ? copy.introDoneEyebrow
    : hasOnboardingProgress
      ? copy.introResumeEyebrow
      : copy.introEyebrow
  const introTitle = onboardingComplete
    ? copy.introDoneTitle
    : hasOnboardingProgress
      ? copy.introResumeTitle
      : copy.introTitle
  const introDescription = onboardingComplete
    ? copy.introDoneDescription
    : hasOnboardingProgress
      ? copy.introResumeDescription
      : copy.introDescription
  const introCta = onboardingComplete
    ? copy.introReview
    : hasOnboardingProgress
      ? copy.introContinue
      : copy.introStart

  function goBack() {
    const previousStep = onboardingStepIds[currentIndex - 1]
    if (previousStep) setCurrentStep(previousStep)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,860px)] w-[min(calc(100dvw-2rem),980px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        )}
        showCloseButton
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">{copy.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {copy.description}
        </DialogDescription>

        {showIntro ? (
          <div className="grid min-h-[420px] gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center lg:gap-10 lg:px-10 lg:py-10">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {introEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {introTitle}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {introDescription}
              </p>

              <div className="mt-8">
                <Button
                  type="button"
                  className="h-11 min-w-48 px-6"
                  onClick={startOnboarding}
                >
                  {introCta}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Button>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[280px] w-full max-w-[280px] lg:block">
              <div className="absolute inset-x-6 top-10 h-32 rounded-full bg-primary/10 blur-3xl" />
              <Image
                src="/Rocket.png"
                alt=""
                width={420}
                height={420}
                className="relative mx-auto h-full w-auto object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-border px-5 pt-6 pb-5 sm:px-8">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {copy.sidebarTitle}
                  </p>
                  <div className="mt-2 flex min-w-0 items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      {currentStep.title}
                    </h2>
                    <HelpTip
                      title={currentStep.shortTitle}
                      text={copy.helpers[currentStep.id]}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {currentStep.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                    {copy.step} {currentIndex + 1} {copy.of} {copy.steps.length}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <StepNavigation
                  copy={copy}
                  currentStep={currentStep}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              {isSaving ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium shadow-lg">
                    <Spinner size="sm" label="" />
                    Сохранение...
                  </div>
                </div>
              ) : null}
              <div
                key={currentStep.id}
                className="grid animate-in gap-6 duration-300 fade-in slide-in-from-bottom-2 sm:grid-cols-2"
              >
                {currentStep.fields.map((field) => (
                  <OnboardingField
                    key={field.name}
                    field={field}
                    copy={copy}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/20 px-5 py-5 sm:px-8">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5"
                onClick={goBack}
                disabled={currentIndex === 0 || isSaving}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                {copy.back}
              </Button>

              <Button
                type="button"
                className="h-11 min-w-48 px-6"
                onClick={saveAndContinue}
                loading={isSaving}
              >
                {isSaving ? "Сохранение..." : copy.saveAndNext}
                {!isSaving ? (
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                ) : null}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function DashboardHome() {
  const language = useLanguageStore((state) => state.language)
  const copy = getDashboardCopy(language)
  const completedStepIds = useOnboardingStore((state) => state.completedStepIds)
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep)
  const onboardingComplete = isOnboardingComplete(completedStepIds)
  const registerData = useRegisterStore((state) => state.data)
  const [onboardingOpen, setOnboardingOpen] = React.useState(false)
  const [hasHydrated, setHasHydrated] = React.useState(false)
  const progress = Math.round(
    (completedStepIds.length / Math.max(copy.onboarding.steps.length, 1)) * 100
  )

  React.useEffect(() => {
    const check = () => {
      if (
        useOnboardingStore.persist.hasHydrated() &&
        useRegisterStore.persist.hasHydrated()
      ) {
        setHasHydrated(true)
      }
    }
    check()
    const unsubOnboarding =
      useOnboardingStore.persist.onFinishHydration(check)
    const unsubRegister = useRegisterStore.persist.onFinishHydration(check)
    return () => {
      unsubOnboarding?.()
      unsubRegister?.()
    }
  }, [])

  // Prefill contractor requisites + open onboarding if incomplete.
  React.useEffect(() => {
    if (!hasHydrated) return
    useOnboardingStore.getState().reconcileCompletedSteps()
    seedOnboardingFromRegister(registerData)

    const completed = useOnboardingStore.getState().completedStepIds
    if (isOnboardingComplete(completed)) return

    setCurrentStep(getFirstIncompleteStep(completed))
    setOnboardingOpen(true)
  }, [hasHydrated, registerData, setCurrentStep])

  if (!hasHydrated) {
    return (
      <main className="min-h-full bg-background">
        <div className="w-full px-4 py-6 sm:px-5 lg:px-6 2xl:px-8">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg border border-border bg-background p-6">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-9 w-64" />
              <Skeleton className="mt-3 h-4 w-full max-w-xl" />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-8 w-16" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                ))}
              </div>
            </div>
            <aside className="rounded-lg border border-border bg-muted/20 p-5">
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="mt-4 h-6 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-5 h-2 w-full rounded-full" />
              <Skeleton className="mt-5 h-11 w-full rounded-lg" />
            </aside>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-full bg-background">
      <div className="w-full animate-in px-4 py-6 duration-300 fade-in sm:px-5 lg:px-6 2xl:px-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border bg-background p-6 transition-shadow hover:shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.home.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {copy.home.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.home.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {copy.home.cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="text-xs text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">
                    {card.value}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {card.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-muted/20 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={Rocket01Icon} size={20} strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {copy.home.setupTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.home.setupDescription}
            </p>
            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{copy.home.progress}</span>
              <span className="tabular-nums">
                {completedStepIds.length}/{copy.onboarding.steps.length}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Button
              type="button"
              className="mt-5 h-11 w-full"
              onClick={() => setOnboardingOpen(true)}
            >
              {onboardingComplete
                ? copy.onboarding.introReview
                : copy.home.openOnboarding}
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </Button>
          </aside>
        </section>
      </div>

      <OnboardingDialog
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        copy={copy.onboarding}
      />
    </main>
  )
}
