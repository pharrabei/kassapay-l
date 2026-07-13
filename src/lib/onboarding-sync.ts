import type { OnboardingStepId } from "@/lib/dashboard-i18n"
import {
  makeEntityId,
  useDirectoriesStore,
} from "@/store/directories-store"
import {
  hasStepEvidence,
  onboardingStepIds,
  useOnboardingStore,
  type OnboardingDraftValue,
} from "@/store/onboarding-store"
import type { RegisterData } from "@/store/register-store"

function asString(value: OnboardingDraftValue | undefined) {
  return typeof value === "string" ? value.trim() : ""
}

function asArray(value: OnboardingDraftValue | undefined) {
  return Array.isArray(value) ? value : []
}

function yesNo(flag: boolean) {
  return flag ? "Да" : "Нет"
}

export function getFirstIncompleteStep(
  completedStepIds: readonly OnboardingStepId[]
): OnboardingStepId {
  return (
    onboardingStepIds.find((stepId) => !completedStepIds.includes(stepId)) ??
    onboardingStepIds[0]
  )
}

/** Prefill contractor fields from registration / invoice billing details. */
export function seedOnboardingFromBilling(data: {
  companyName?: string
  bin?: string
  bank?: string
  bik?: string
  account?: string
  legalAddress?: string
  /** Drop stale completed flags from previous sessions. */
  resetCompleted?: boolean
}) {
  const store = useOnboardingStore.getState()

  if (data.resetCompleted) {
    store.resetProgress()
  } else {
    store.reconcileCompletedSteps()
  }

  const patches: Record<string, string> = {}

  if (data.companyName?.trim()) patches.contractorName = data.companyName.trim()
  if (data.bin?.trim()) patches.bin = data.bin.trim()
  if (data.bank?.trim()) patches.bank = data.bank.trim()
  if (data.bik?.trim()) patches.bik = data.bik.trim()
  if (data.account?.trim()) patches.account = data.account.trim()
  if (data.legalAddress?.trim()) patches.legalAddress = data.legalAddress.trim()

  if (Object.keys(patches).length === 0) return

  // After reset, force-write values.
  if (data.resetCompleted) {
    for (const [key, value] of Object.entries(patches)) {
      store.updateDraft(key, value)
    }
  } else {
    store.patchDrafts(patches)
  }

  // Linked select for object step
  if (patches.contractorName) {
    store.updateDraft("contractor", patches.contractorName)
  }

  // Mirror into directories immediately so справочники stay in sync
  if (patches.contractorName || patches.bin) {
    const drafts = { ...useOnboardingStore.getState().drafts, ...patches }
    syncOnboardingStepToDirectories("contractors", drafts)
  }

  store.reconcileCompletedSteps()

  // Full billing from invoice counts as contractor step progress.
  if (
    data.resetCompleted &&
    hasStepEvidence("contractors", useOnboardingStore.getState().drafts)
  ) {
    store.markStepComplete("contractors")
  }

  store.setCurrentStep(
    getFirstIncompleteStep(useOnboardingStore.getState().completedStepIds)
  )
}

export function seedOnboardingFromRegister(data: RegisterData) {
  seedOnboardingFromBilling({
    companyName: data.companyName,
    bin: data.bin,
    bank: data.bank,
    bik: data.bik,
    account: data.account,
    legalAddress: data.legalAddress,
  })
}

export function syncOnboardingStepToDirectories(
  stepId: OnboardingStepId,
  drafts: Record<string, OnboardingDraftValue>
) {
  const directories = useDirectoriesStore.getState()

  if (stepId === "contractors") {
    const name = asString(drafts.contractorName)
    const bin = asString(drafts.bin)
    if (!name && !bin) return
    directories.upsertContractor({
      id: makeEntityId("contractor", bin || name),
      name: name || `БИН ${bin}`,
      bin,
      bank: asString(drafts.bank),
      account: asString(drafts.account),
      bik: asString(drafts.bik),
      legalAddress: asString(drafts.legalAddress),
    })
    return
  }

  if (stepId === "object") {
    const name = asString(drafts.objectName)
    if (!name) return
    directories.upsertObject({
      id: makeEntityId("object", name),
      nameRu: name,
      nameKk: asString(drafts.objectNameKk),
      nameEn: asString(drafts.objectNameEn),
      shortName: asString(drafts.shortName),
      contractor: asString(drafts.contractor),
      address: asString(drafts.address),
      website: asString(drafts.website),
      email: asString(drafts.email),
      phone: asString(drafts.phone),
      icon: asString(drafts.fontAwesomeIcon) || asString(drafts.icon),
    })
    return
  }

  if (stepId === "services") {
    const name = asString(drafts.serviceName)
    if (!name) return
    const flags = asArray(drafts.serviceFlags)
    const sales = asArray(drafts.salesTypes)
    directories.upsertService({
      id: makeEntityId("service", name),
      nameRu: name,
      nameKk: asString(drafts.serviceNameKk),
      nameEn: asString(drafts.serviceNameEn),
      category: asString(drafts.serviceCategory) || "—",
      salesChannels: sales.length ? sales.join(", ") : "—",
      ticketAccounting: yesNo(
        flags.some((item) => /подсчет|билет|билетов/i.test(item))
      ),
      multiUse: yesNo(flags.some((item) => /многораз/i.test(item))),
      guide: yesNo(flags.some((item) => /экскурсовод/i.test(item))),
    })
    return
  }

  if (stepId === "events") {
    const name = asString(drafts.eventName)
    if (!name) return
    directories.upsertEvent({
      id: makeEntityId("event", name),
      name,
      logo: asString(drafts.eventLogo),
      objects: asString(drafts.eventObject) || "—",
      services: asArray(drafts.eventServices).join(", ") || "—",
      description: asString(drafts.eventDescription) || "—",
      status: "Активно",
    })
    return
  }

  if (stepId === "sessions") {
    const name = asString(drafts.sessionName)
    if (!name) return
    directories.upsertSession({
      id: makeEntityId("session", name),
      nameRu: name,
      nameKk: asString(drafts.sessionNameKk),
      nameEn: asString(drafts.sessionNameEn),
      template: asString(drafts.eventTemplate) || "—",
      startDate: asString(drafts.startDate) || "—",
      endDate: asString(drafts.endDate) || "—",
      weekdays: asArray(drafts.weekdays).join(", ") || "—",
      tickets: asString(drafts.ticketLimit) || "—",
    })
  }
}
