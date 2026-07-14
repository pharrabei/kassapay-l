"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppLanguage } from "@/store/language-store"

export type NotificationType = "info" | "success" | "warning"

export interface NotificationItem {
  id: string
  type: NotificationType
  title: Record<AppLanguage, string>
  description: Record<AppLanguage, string>
  createdAt: string
  read: boolean
  href?: string
}

interface NotificationsState {
  items: NotificationItem[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  remove: (id: string) => void
  clearAll: () => void
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

const seedNotifications: NotificationItem[] = [
  {
    id: "n-welcome",
    type: "success",
    title: {
      ru: "Добро пожаловать в KassaPay",
      kk: "KassaPay-ге қош келдіңіз",
    },
    description: {
      ru: "Аккаунт готов. Заполните онбординг, чтобы запустить продажи.",
      kk: "Аккаунт дайын. Сатылымды бастау үшін онбордингті толтырыңыз.",
    },
    createdAt: hoursAgo(1),
    read: false,
    href: "/dashboard",
  },
  {
    id: "n-directories",
    type: "info",
    title: {
      ru: "Справочники доступны",
      kk: "Анықтамалықтар қолжетімді",
    },
    description: {
      ru: "Добавьте контрагента, объекты и услуги в разделе «Справочники».",
      kk: "«Анықтамалықтар» бөлімінде контрагент, объектілер және қызметтерді қосыңыз.",
    },
    createdAt: hoursAgo(5),
    read: false,
    href: "/dashboard/directories/contractors",
  },
  {
    id: "n-profile",
    type: "warning",
    title: {
      ru: "Заполните профиль",
      kk: "Профильді толтырыңыз",
    },
    description: {
      ru: "Укажите ФИО и email — так проще работать с командой.",
      kk: "Аты-жөні мен email енгізіңіз — командамен жұмыс ыңғайлырақ болады.",
    },
    createdAt: hoursAgo(26),
    read: true,
  },
]

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      items: seedNotifications,
      markAsRead: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          items: state.items.map((item) =>
            item.read ? item : { ...item, read: true }
          ),
        })),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: "kassapay-notifications",
    }
  )
)

export function selectUnreadCount(items: NotificationItem[]) {
  return items.reduce((count, item) => count + (item.read ? 0 : 1), 0)
}
