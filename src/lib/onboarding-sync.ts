import {
  makeEntityId,
  useDirectoriesStore,
} from "@/store/directories-store"
import type { RegisterData } from "@/store/register-store"

/**
 * Prefill contractor directory from registration / invoice billing.
 * Does NOT complete tour stages — user must create records through guided UI
 * (or already have them in directories from a previous save).
 */
export function seedContractorFromBilling(data: {
  companyName?: string
  bin?: string
  bank?: string
  bik?: string
  account?: string
  legalAddress?: string
  /** When true, upsert contractor into directories for convenience. */
  writeDirectory?: boolean
}) {
  if (!data.writeDirectory) return

  const name = data.companyName?.trim()
  const bin = data.bin?.trim()
  if (!name && !bin) return

  useDirectoriesStore.getState().upsertContractor({
    id: makeEntityId("contractor", bin || name || "billing"),
    name: name || `БИН ${bin}`,
    bin: bin ?? "",
    bank: data.bank?.trim() ?? "",
    account: data.account?.trim() ?? "",
    bik: data.bik?.trim() ?? "",
    legalAddress: data.legalAddress?.trim() ?? "",
  })
}

export function seedOnboardingFromBilling(data: {
  companyName?: string
  bin?: string
  bank?: string
  bik?: string
  account?: string
  legalAddress?: string
  resetCompleted?: boolean
}) {
  // Legacy name kept for call sites — only mirrors billing into directories optionally.
  // Tour progress is independent; do not auto-complete stages.
  if (data.companyName?.trim() || data.bin?.trim()) {
    seedContractorFromBilling({ ...data, writeDirectory: false })
  }
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

/** @deprecated Old wizard sync — no-op for compatibility. */
export function syncOnboardingStepToDirectories() {
  // Intentionally empty: tour completes via real DirectoryPage saves.
}

export function getFirstIncompleteStep() {
  return "contractors" as const
}
