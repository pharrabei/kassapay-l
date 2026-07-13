"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DirectoryKind } from "@/lib/dashboard-i18n"

export interface ContractorEntity {
  id: string
  name: string
  bin: string
  bank: string
  account: string
  bik: string
  legalAddress: string
}

export interface ObjectEntity {
  id: string
  /** Primary RU name; legacy `name` may still exist in storage. */
  nameRu: string
  nameKk: string
  nameEn: string
  shortName: string
  contractor: string
  address: string
  website: string
  email: string
  phone: string
  icon: string
  /** @deprecated kept for old localStorage records */
  name?: string
}

export interface ServiceEntity {
  id: string
  nameRu: string
  nameKk: string
  nameEn: string
  category: string
  salesChannels: string
  ticketAccounting: string
  multiUse: string
  guide: string
  /** @deprecated */
  name?: string
}

export interface EventEntity {
  id: string
  name: string
  logo: string
  objects: string
  services: string
  description: string
  status: string
}

export interface SessionEntity {
  id: string
  nameRu: string
  nameKk: string
  nameEn: string
  template: string
  startDate: string
  endDate: string
  weekdays: string
  tickets: string
  /** @deprecated */
  name?: string
}

export interface CategoryEntity {
  id: string
  name: string
  order: string
  position: string
  status: string
}

export type DirectoryEntity =
  | ContractorEntity
  | ObjectEntity
  | ServiceEntity
  | EventEntity
  | SessionEntity
  | CategoryEntity

interface DirectoriesState {
  contractors: ContractorEntity[]
  objects: ObjectEntity[]
  services: ServiceEntity[]
  events: EventEntity[]
  sessions: SessionEntity[]
  categories: CategoryEntity[]
  upsertContractor: (item: ContractorEntity) => void
  upsertObject: (item: ObjectEntity) => void
  upsertService: (item: ServiceEntity) => void
  upsertEvent: (item: EventEntity) => void
  upsertSession: (item: SessionEntity) => void
  upsertCategory: (item: CategoryEntity) => void
  removeEntity: (kind: DirectoryKind, id: string) => void
  upsertEntity: (kind: DirectoryKind, item: DirectoryEntity) => void
}

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id)
  if (index === -1) return [...list, item]
  const next = [...list]
  next[index] = { ...next[index], ...item }
  return next
}

function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((entry) => entry.id !== id)
}

const kindToKey = {
  contractors: "contractors",
  objects: "objects",
  events: "events",
  services: "services",
  sessions: "sessions",
  "service-categories": "categories",
} as const satisfies Record<DirectoryKind, keyof DirectoriesState>

function normalizeObject(item: ObjectEntity): ObjectEntity {
  const nameRu = item.nameRu?.trim() || item.name?.trim() || ""
  return {
    id: item.id,
    nameRu,
    nameKk: item.nameKk ?? "",
    nameEn: item.nameEn ?? "",
    shortName: item.shortName ?? "",
    contractor: item.contractor ?? "",
    address: item.address ?? "",
    website: item.website ?? "",
    email: item.email ?? "",
    phone: item.phone ?? "",
    icon: item.icon ?? "",
  }
}

function normalizeService(item: ServiceEntity): ServiceEntity {
  const nameRu = item.nameRu?.trim() || item.name?.trim() || ""
  return {
    id: item.id,
    nameRu,
    nameKk: item.nameKk ?? "",
    nameEn: item.nameEn ?? "",
    category: item.category ?? "",
    salesChannels: item.salesChannels ?? "",
    ticketAccounting: item.ticketAccounting ?? "",
    multiUse: item.multiUse ?? "",
    guide: item.guide ?? "",
  }
}

function normalizeSession(item: SessionEntity): SessionEntity {
  const nameRu = item.nameRu?.trim() || item.name?.trim() || ""
  return {
    id: item.id,
    nameRu,
    nameKk: item.nameKk ?? "",
    nameEn: item.nameEn ?? "",
    template: item.template ?? "",
    startDate: item.startDate ?? "",
    endDate: item.endDate ?? "",
    weekdays: item.weekdays ?? "",
    tickets: item.tickets ?? "",
  }
}

function normalizeEvent(item: EventEntity): EventEntity {
  return {
    id: item.id,
    name: item.name ?? "",
    logo: item.logo ?? "",
    objects: item.objects ?? "",
    services: item.services ?? "",
    description: item.description ?? "",
    status: item.status ?? "",
  }
}

export const useDirectoriesStore = create<DirectoriesState>()(
  persist(
    (set) => ({
      contractors: [],
      objects: [],
      services: [],
      events: [],
      sessions: [],
      categories: [],
      upsertContractor: (item) =>
        set((state) => ({
          contractors: upsertById(state.contractors, item),
        })),
      upsertObject: (item) =>
        set((state) => ({
          objects: upsertById(state.objects, normalizeObject(item)),
        })),
      upsertService: (item) =>
        set((state) => ({
          services: upsertById(state.services, normalizeService(item)),
        })),
      upsertEvent: (item) =>
        set((state) => ({
          events: upsertById(state.events, normalizeEvent(item)),
        })),
      upsertSession: (item) =>
        set((state) => ({
          sessions: upsertById(state.sessions, normalizeSession(item)),
        })),
      upsertCategory: (item) =>
        set((state) => ({
          categories: upsertById(state.categories, item),
        })),
      removeEntity: (kind, id) =>
        set((state) => {
          const key = kindToKey[kind]
          return {
            [key]: removeById(state[key] as { id: string }[], id),
          } as Partial<DirectoriesState>
        }),
      upsertEntity: (kind, item) =>
        set((state) => {
          const key = kindToKey[kind]
          let nextItem = item
          if (kind === "objects") nextItem = normalizeObject(item as ObjectEntity)
          if (kind === "services")
            nextItem = normalizeService(item as ServiceEntity)
          if (kind === "sessions")
            nextItem = normalizeSession(item as SessionEntity)
          if (kind === "events") nextItem = normalizeEvent(item as EventEntity)
          const list = state[key] as DirectoryEntity[]
          return {
            [key]: upsertById(list, nextItem),
          } as Partial<DirectoriesState>
        }),
    }),
    {
      name: "kassapay-directories",
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<DirectoriesState>
        return {
          contractors: state.contractors ?? [],
          objects: (state.objects ?? []).map((item) =>
            normalizeObject(item as ObjectEntity)
          ),
          services: (state.services ?? []).map((item) =>
            normalizeService(item as ServiceEntity)
          ),
          events: (state.events ?? []).map((item) =>
            normalizeEvent(item as EventEntity)
          ),
          sessions: (state.sessions ?? []).map((item) =>
            normalizeSession(item as SessionEntity)
          ),
          categories: state.categories ?? [],
        }
      },
    }
  )
)

export function getEntitiesForKind(
  kind: DirectoryKind,
  state: Pick<
    DirectoriesState,
    | "contractors"
    | "objects"
    | "services"
    | "events"
    | "sessions"
    | "categories"
  >
): DirectoryEntity[] {
  switch (kind) {
    case "contractors":
      return state.contractors
    case "objects":
      return state.objects
    case "services":
      return state.services
    case "events":
      return state.events
    case "sessions":
      return state.sessions
    case "service-categories":
      return state.categories
    default:
      return []
  }
}

export function makeEntityId(prefix: string, key: string) {
  const normalized = key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9а-яёқғүұөһі\-]/gi, "")
  return `${prefix}-${normalized || "item"}`
}
