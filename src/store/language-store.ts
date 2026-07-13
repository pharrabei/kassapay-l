"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AppLanguage = "ru" | "kk"

interface LanguageState {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "ru",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "kassapay-language",
    }
  )
)
