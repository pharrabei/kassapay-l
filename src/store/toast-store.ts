"use client"

import { create } from "zustand"

export type ToastVariant = "default" | "success" | "error" | "info"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, "id"> & { id?: string }) => string
  dismiss: (id: string) => void
  clear: () => void
}

let toastSeq = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? `toast-${Date.now()}-${++toastSeq}`
    const item: ToastItem = {
      id,
      title: toast.title,
      description: toast.description,
      variant: toast.variant ?? "default",
      duration: toast.duration ?? 3200,
    }
    set((state) => ({ toasts: [...state.toasts.slice(-4), item] }))
    return id
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

export function toast(input: {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}) {
  return useToastStore.getState().push({
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
    duration: input.duration ?? 3200,
  })
}
