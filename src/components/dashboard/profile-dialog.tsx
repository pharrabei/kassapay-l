"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  Building06Icon,
  Call02Icon,
  Camera01Icon,
  Delete02Icon,
  Mail01Icon,
  PencilEdit01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  useProfileStore,
  type ProfileData,
} from "@/store/profile-store"
import { toast } from "@/store/toast-store"
import type { DashboardCopy } from "@/lib/dashboard-i18n"
import { cn } from "@/lib/utils"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  copy: DashboardCopy["profile"]
}

type ProfileMode = "view" | "edit"
type ProfileField = keyof ProfileData
type FieldErrors = Partial<Record<ProfileField, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/
const FIELD_INPUT_CLASS = "h-10 w-full"

function profilesEqual(a: ProfileData, b: ProfileData) {
  return (
    a.fullName === b.fullName &&
    a.position === b.position &&
    a.phone === b.phone &&
    a.email === b.email &&
    a.organization === b.organization &&
    a.photoUrl === b.photoUrl
  )
}

function getInitials(name: string, fallback: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback.slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

function displayValue(value: string, emptyLabel: string) {
  const trimmed = value.trim()
  return trimmed || emptyLabel
}

export function ProfileDialog({ open, onOpenChange, copy }: ProfileDialogProps) {
  const profile = useProfileStore((state) => state.profile)
  const updateProfile = useProfileStore((state) => state.updateProfile)

  const [mode, setMode] = React.useState<ProfileMode>("view")
  const [draft, setDraft] = React.useState<ProfileData>(profile)
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [isSaving, setIsSaving] = React.useState(false)
  const [isPhotoLoading, setIsPhotoLoading] = React.useState(false)
  /** null = no confirm; leave-edit stays open on view; close-dialog closes modal */
  const [pendingDiscard, setPendingDiscard] = React.useState<
    null | "leave-edit" | "close-dialog"
  >(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)

  const isDirty = !profilesEqual(draft, profile)
  const confirmDiscard = pendingDiscard !== null

  const displayName = draft.fullName.trim() || copy.defaultFullName
  const displayPosition = draft.position.trim() || copy.defaultPosition
  const initials = getInitials(displayName, copy.defaultFullName)

  function resetFromProfile(nextProfile = profile) {
    setDraft(nextProfile)
    setErrors({})
    setIsSaving(false)
    setIsPhotoLoading(false)
    setPendingDiscard(null)
    setMode("view")
  }

  React.useEffect(() => {
    if (open) {
      resetFromProfile(profile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when dialog opens
  }, [open])

  function updateField(field: ProfileField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validate(data: ProfileData): FieldErrors {
    const next: FieldErrors = {}
    const fullName = data.fullName.trim()
    const email = data.email.trim()
    const phone = data.phone.trim()

    if (!fullName) next.fullName = copy.errors.required
    if (!email) next.email = copy.errors.required
    else if (!EMAIL_RE.test(email)) next.email = copy.errors.invalidEmail
    if (phone && !PHONE_RE.test(phone)) next.phone = copy.errors.invalidPhone

    return next
  }

  function requestClose() {
    if (mode === "edit" && isDirty) {
      setPendingDiscard("close-dialog")
      return
    }
    onOpenChange(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true)
      return
    }
    requestClose()
  }

  function enterEdit() {
    setDraft(profile)
    setErrors({})
    setPendingDiscard(null)
    setMode("edit")
  }

  function cancelEdit() {
    if (isDirty) {
      setPendingDiscard("leave-edit")
      return
    }
    resetFromProfile()
  }

  function confirmDiscardAction() {
    if (pendingDiscard === "close-dialog") {
      resetFromProfile()
      onOpenChange(false)
      return
    }
    resetFromProfile()
  }

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Allow re-selecting the same file later.
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        photoUrl: copy.errors.invalidPhoto,
      }))
      return
    }

    setIsPhotoLoading(true)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("photoUrl", reader.result)
      }
      setIsPhotoLoading(false)
    }
    reader.onerror = () => setIsPhotoLoading(false)
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    updateField("photoUrl", "")
    if (photoInputRef.current) photoInputRef.current.value = ""
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const firstErrorField = Object.keys(nextErrors)[0]
      const el = document.getElementById(`profile-${firstErrorField}`)
      el?.focus()
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 450))

    const normalized: ProfileData = {
      fullName: draft.fullName.trim(),
      position: draft.position.trim(),
      organization: draft.organization.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      photoUrl: draft.photoUrl,
    }

    updateProfile(normalized)
    setDraft(normalized)
    setIsSaving(false)
    setMode("view")
    setPendingDiscard(null)
    toast({
      title: copy.savedTitle,
      description: copy.savedDescription,
      variant: "success",
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[min(100dvh-1.5rem,36rem)] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={!confirmDiscard}
        onPointerDownOutside={(event) => {
          if (mode === "edit" && isDirty) {
            event.preventDefault()
            setPendingDiscard("close-dialog")
          }
        }}
        onEscapeKeyDown={(event) => {
          if (confirmDiscard) {
            event.preventDefault()
            setPendingDiscard(null)
            return
          }
          if (mode === "edit" && isDirty) {
            event.preventDefault()
            setPendingDiscard("close-dialog")
          }
        }}
      >
        {confirmDiscard ? (
          <div className="space-y-4 p-4 sm:p-5">
            <DialogHeader className="gap-1.5">
              <DialogTitle>{copy.unsavedTitle}</DialogTitle>
              <DialogDescription>{copy.unsavedDescription}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingDiscard(null)}
              >
                {copy.keepEditing}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDiscardAction}
              >
                {pendingDiscard === "close-dialog"
                  ? copy.discardAndClose
                  : copy.discard}
              </Button>
            </div>
          </div>
        ) : mode === "view" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative shrink-0">
              <div className="h-14 bg-gradient-to-br from-primary/25 via-primary/10 to-muted sm:h-16" />
              <div className="absolute inset-x-0 top-7 flex justify-center sm:top-8">
                <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-xl border-4 border-popover bg-muted text-muted-foreground shadow-sm sm:size-[4.5rem]">
                  {draft.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.photoUrl}
                      alt={copy.photo}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold tracking-wide text-foreground/70">
                      {initials}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 text-center sm:px-5">
              <div className="mt-10 space-y-3 sm:mt-11">
                <DialogHeader className="items-center gap-0.5 text-center">
                  <DialogTitle className="text-base font-semibold tracking-tight sm:text-lg">
                    {displayName}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    {displayPosition}
                    {draft.organization.trim()
                      ? ` · ${draft.organization.trim()}`
                      : ""}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 text-left">
                  <ProfileInfoCard title={copy.personalSection}>
                    <InfoRow
                      icon={UserIcon}
                      label={copy.fullName}
                      value={displayValue(draft.fullName, copy.emptyValue)}
                    />
                    <InfoRow
                      icon={Briefcase01Icon}
                      label={copy.position}
                      value={displayValue(draft.position, copy.emptyValue)}
                    />
                    <InfoRow
                      icon={Building06Icon}
                      label={copy.organization}
                      value={displayValue(draft.organization, copy.emptyValue)}
                    />
                  </ProfileInfoCard>

                  <ProfileInfoCard title={copy.contactsSection}>
                    <InfoRow
                      icon={Call02Icon}
                      label={copy.phone}
                      value={displayValue(draft.phone, copy.emptyValue)}
                    />
                    <InfoRow
                      icon={Mail01Icon}
                      label={copy.email}
                      value={displayValue(draft.email, copy.emptyValue)}
                    />
                  </ProfileInfoCard>
                </div>
              </div>
            </div>

            <DialogFooter className="m-0 shrink-0 rounded-none border-t border-border bg-muted/30 p-3 sm:p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {copy.close}
              </Button>
              <Button type="button" onClick={enterEdit}>
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  size={16}
                  strokeWidth={2}
                />
                {copy.edit}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={saveProfile}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0 border-b border-border px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground sm:size-16">
                  {draft.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.photoUrl}
                      alt={copy.photo}
                      className="size-full object-cover"
                    />
                  ) : (
                    <HugeiconsIcon icon={UserIcon} size={22} strokeWidth={2} />
                  )}
                  {isPhotoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                      <Spinner size="sm" label={copy.photoLoading} />
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <DialogHeader className="gap-0.5 text-left">
                    <DialogTitle className="text-base">
                      {copy.editTitle}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      {copy.editDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-1.5">
                    <label
                      htmlFor="profile-photo"
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted",
                        (isSaving || isPhotoLoading) &&
                          "pointer-events-none opacity-50"
                      )}
                    >
                      {isPhotoLoading ? (
                        <Spinner size="sm" label="" />
                      ) : (
                        <HugeiconsIcon
                          icon={Camera01Icon}
                          size={14}
                          strokeWidth={2}
                        />
                      )}
                      {draft.photoUrl ? copy.changePhoto : copy.uploadPhoto}
                    </label>
                    {draft.photoUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={removePhoto}
                        disabled={isSaving || isPhotoLoading}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          size={14}
                          strokeWidth={2}
                        />
                        {copy.removePhoto}
                      </Button>
                    ) : null}
                  </div>
                  <input
                    ref={photoInputRef}
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onPhotoChange}
                    disabled={isSaving || isPhotoLoading}
                  />
                  {errors.photoUrl ? (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.photoUrl}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  id="profile-fullName"
                  label={copy.fullName}
                  required
                  error={errors.fullName}
                >
                  <Input
                    id="profile-fullName"
                    value={draft.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                    placeholder={copy.placeholders.fullName}
                    disabled={isSaving}
                    aria-invalid={Boolean(errors.fullName)}
                    autoComplete="name"
                    className={FIELD_INPUT_CLASS}
                  />
                </Field>

                <Field
                  id="profile-position"
                  label={copy.position}
                  error={errors.position}
                >
                  <Input
                    id="profile-position"
                    value={draft.position}
                    onChange={(event) =>
                      updateField("position", event.target.value)
                    }
                    placeholder={copy.placeholders.position}
                    disabled={isSaving}
                    aria-invalid={Boolean(errors.position)}
                    autoComplete="organization-title"
                    className={FIELD_INPUT_CLASS}
                  />
                </Field>

                <Field
                  id="profile-organization"
                  label={copy.organization}
                  error={errors.organization}
                >
                  <Input
                    id="profile-organization"
                    value={draft.organization}
                    onChange={(event) =>
                      updateField("organization", event.target.value)
                    }
                    placeholder={copy.placeholders.organization}
                    disabled={isSaving}
                    aria-invalid={Boolean(errors.organization)}
                    autoComplete="organization"
                    className={FIELD_INPUT_CLASS}
                  />
                </Field>

                <Field
                  id="profile-phone"
                  label={copy.phone}
                  error={errors.phone}
                >
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={draft.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder={copy.placeholders.phone}
                    disabled={isSaving}
                    aria-invalid={Boolean(errors.phone)}
                    autoComplete="tel"
                    className={FIELD_INPUT_CLASS}
                  />
                </Field>

                <Field
                  id="profile-email"
                  label={copy.email}
                  required
                  error={errors.email}
                >
                  <Input
                    id="profile-email"
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder={copy.placeholders.email}
                    disabled={isSaving}
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                    className={FIELD_INPUT_CLASS}
                  />
                </Field>
              </div>
            </div>

            <DialogFooter className="m-0 shrink-0 rounded-none p-3 sm:p-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={cancelEdit}
              >
                {copy.cancel}
              </Button>
              <Button
                type="submit"
                loading={isSaving}
                disabled={isPhotoLoading}
              >
                {isSaving ? copy.saving : copy.save}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProfileInfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-primary/10 bg-primary/[0.02] text-left">
      <div className="border-b border-primary/10 bg-primary/[0.05] px-3 py-1.5">
        <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-primary/10">{children}</div>
    </section>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: typeof UserIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <HugeiconsIcon icon={icon} size={14} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium leading-snug text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="truncate">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      <p
        className={cn(
          "min-h-4 text-xs text-destructive",
          !error && "invisible"
        )}
        role={error ? "alert" : undefined}
      >
        {error || "\u00a0"}
      </p>
    </div>
  )
}
