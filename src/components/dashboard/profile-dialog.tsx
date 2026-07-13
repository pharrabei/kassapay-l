"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useProfileStore } from "@/store/profile-store"
import { toast } from "@/store/toast-store"
import type { DashboardCopy } from "@/lib/dashboard-i18n"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  copy: DashboardCopy["profile"]
}

export function ProfileDialog({ open, onOpenChange, copy }: ProfileDialogProps) {
  const profile = useProfileStore((state) => state.profile)
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const [draft, setDraft] = React.useState(profile)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isPhotoLoading, setIsPhotoLoading] = React.useState(false)

  function updateField(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(profile)
      setIsSaving(false)
      setIsPhotoLoading(false)
    }
    onOpenChange(nextOpen)
  }

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

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

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    updateProfile(draft)
    setIsSaving(false)
    onOpenChange(false)
    toast({
      title: "Профиль сохранён",
      description: "Изменения успешно применены.",
      variant: "success",
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <form onSubmit={saveProfile}>
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-5 py-5">
            <div className="flex items-center gap-4">
              <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
                {draft.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.photoUrl}
                    alt={copy.photo}
                    className="size-full object-cover"
                  />
                ) : (
                  <HugeiconsIcon icon={UserIcon} size={30} strokeWidth={2} />
                )}
                {isPhotoLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                    <Spinner size="sm" label="Загрузка фото" />
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="profile-photo">{copy.photo}</Label>
                <label
                  htmlFor="profile-photo"
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={isSaving || isPhotoLoading}
                >
                  {isPhotoLoading ? (
                    <Spinner size="sm" label="" />
                  ) : (
                    <HugeiconsIcon
                      icon={Camera01Icon}
                      size={16}
                      strokeWidth={2}
                    />
                  )}
                  {copy.uploadPhoto}
                </label>
                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onPhotoChange}
                  disabled={isSaving || isPhotoLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-full-name">{copy.fullName}</Label>
                <Input
                  id="profile-full-name"
                  value={draft.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-position">{copy.position}</Label>
                <Input
                  id="profile-position"
                  value={draft.position}
                  onChange={(event) => updateField("position", event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-organization">{copy.organization}</Label>
                <Input
                  id="profile-organization"
                  value={draft.organization}
                  onChange={(event) =>
                    updateField("organization", event.target.value)
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">{copy.phone}</Label>
                <Input
                  id="profile-phone"
                  value={draft.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">{copy.email}</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={draft.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="m-0 rounded-none">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>
                {copy.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSaving}>
              {isSaving ? "Сохранение..." : copy.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
