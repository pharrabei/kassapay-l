import dashboardTranslations from "@/locales/dashboard.json"
import directoryTranslations from "@/locales/directories.json"
import type { AppLanguage } from "@/store/language-store"

export type SidebarSectionId = "dashboard" | "directories" | "settings"

export type DirectoryKind =
  | "contractors"
  | "objects"
  | "events"
  | "service-categories"
  | "services"
  | "sessions"

export type OnboardingStepId =
  | "contractors"
  | "object"
  | "services"
  | "events"
  | "sessions"

export type OnboardingOptionsFrom =
  | "contractor"
  | "object"
  | "service"
  | "event"

export type DashboardIconKey =
  | "dashboard"
  | "invoice"
  | "task"
  | "filter"
  | "time"
  | "check"
  | "folderOpen"
  | "folder"
  | "calendar"
  | "users"
  | "archive"
  | "user"
  | "security"
  | "settings"

export interface DashboardMenuItemCopy {
  icon: DashboardIconKey
  label: string
  href?: string
  active?: boolean
  children?: string[]
}

export interface DashboardMenuSectionCopy {
  title: string
  items: DashboardMenuItemCopy[]
}

export interface DashboardSidebarContentCopy {
  title: string
  sections: DashboardMenuSectionCopy[]
}

export type OnboardingFieldType =
  | "text"
  | "url"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "file"
  | "textarea"
  | "select"
  | "checkbox"
  | "checkboxGroup"
  | "timeList"

export interface OnboardingFieldCopy {
  name: string
  label: string
  type: OnboardingFieldType
  required?: boolean
  placeholder?: string
  help?: string
  optionsKey?: keyof OnboardingOptionsCopy
  /** Dynamic options built from a previous onboarding step entity. */
  optionsFrom?: OnboardingOptionsFrom
  emptyHint?: string
}

export interface OnboardingStepCopy {
  id: OnboardingStepId
  title: string
  shortTitle: string
  description: string
  image: string
  fields: OnboardingFieldCopy[]
}

export interface OnboardingOptionsCopy {
  serviceFlags: string[]
  weekdays: string[]
  salesTypes: string[]
}

export interface OnboardingCopy {
  eyebrow: string
  title: string
  description: string
  introEyebrow: string
  introTitle: string
  introDescription: string
  introResumeEyebrow: string
  introResumeTitle: string
  introResumeDescription: string
  introDoneEyebrow: string
  introDoneTitle: string
  introDoneDescription: string
  introStart: string
  introContinue: string
  introReview: string
  introProgress: string
  progress: string
  step: string
  of: string
  save: string
  saveAndNext: string
  next: string
  back: string
  completed: string
  notCompleted: string
  draft: string
  sidebarTitle: string
  sidebarHint: string
  formTitle: string
  formHint: string
  source: string
  selectPlaceholder: string
  multiSelectPlaceholder: string
  clearSelection: string
  emptyLinkHint: string
  addTime: string
  timePlaceholder: string
  timeQuick: string
  timeHour: string
  timeMinute: string
  timeAlreadyAdded: string
  removeTime: string
  helpers: Record<OnboardingStepId, string>
  options: OnboardingOptionsCopy
  steps: OnboardingStepCopy[]
}

export interface DashboardCopy {
  home: {
    eyebrow: string
    title: string
    description: string
    setupTitle: string
    setupDescription: string
    progress: string
    openOnboarding: string
    cards: Array<{
      label: string
      value: string
      hint: string
    }>
  }
  header: {
    dashboard: string
    search: string
    notifications: string
    profile: string
    language: string
    editProfile: string
    languages: Record<AppLanguage, string>
  }
  profile: {
    title: string
    description: string
    defaultFullName: string
    defaultPosition: string
    photo: string
    uploadPhoto: string
    fullName: string
    position: string
    phone: string
    email: string
    organization: string
    cancel: string
    save: string
  }
  sidebar: {
    search: string
    settings: string
    logout: string
    expand: string
    collapse: string
    nav: Record<SidebarSectionId, string>
    content: Record<SidebarSectionId, DashboardSidebarContentCopy>
  }
  directories: {
    common: {
      search: string
      date: string
      add: string
      rows: string
      page: string
      of: string
      previous: string
      next: string
      actions: string
      edit: string
      empty: string
    }
    pages: Record<
      DirectoryKind,
      {
        title: string
        description: string
        addLabel: string
        columns: string[]
        rows: string[][]
      }
    >
  }
  onboarding: OnboardingCopy
}

const translations = dashboardTranslations as Record<AppLanguage, DashboardCopy>
const directories = directoryTranslations as Record<
  AppLanguage,
  DashboardCopy["directories"]
>

export function getDashboardCopy(language: AppLanguage) {
  return {
    ...translations[language],
    directories: directories[language],
  }
}
