import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RegisterStep = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type AuthMode = "login" | "register"

export type TariffPlan = "START" | "BUSINESS" | "ENTERPRISE"

export type TariffPeriod = "1m" | "3m" | "6m" | "12m"

export type PaymentMethod = "CARD" | "KASPI_QR" | "PDF"

export interface RegisterData {
  phone?: string
  smsCode?: string
  login?: string
  password?: string
  tariff?: TariffPlan
  tariffPeriod?: TariffPeriod
  paymentMethod?: PaymentMethod
  /** Billing / contractor requisites for invoice + onboarding seed */
  companyName?: string
  bin?: string
  bank?: string
  bik?: string
  account?: string
  legalAddress?: string
}

interface RegisterState {
  step: RegisterStep
  authMode: AuthMode
  data: RegisterData
  setStep: (step: RegisterStep) => void
  setAuthMode: (mode: AuthMode) => void
  updateData: (newData: Partial<RegisterData>) => void
  nextStep: () => void
  prevStep: () => void
  resetRegisterFlow: () => void
  resetRegisterStore: () => void
}

const initialData: RegisterData = {}

const MIN_STEP: RegisterStep = 0
const MAX_STEP: RegisterStep = 6

export const useRegisterStore = create<RegisterState>()(
  persist(
    (set) => ({
      step: 0,
      authMode: "login",
      data: initialData,

      setStep: (step) => set({ step }),

      setAuthMode: (authMode) => set({ authMode }),

      updateData: (newData) =>
        set((state) => ({ data: { ...state.data, ...newData } })),

      nextStep: () =>
        set((state) => ({
          step:
            state.step < MAX_STEP
              ? ((state.step + 1) as RegisterStep)
              : state.step,
        })),

      prevStep: () =>
        set((state) => ({
          step:
            state.step > MIN_STEP
              ? ((state.step - 1) as RegisterStep)
              : state.step,
        })),

      resetRegisterFlow: () => set({ step: 0, authMode: "login" }),

      resetRegisterStore: () =>
        set({ step: 0, authMode: "login", data: initialData }),
    }),
    {
      name: "kassapay-register-cache",
      partialize: (state) => ({ data: state.data }),
    }
  )
)
