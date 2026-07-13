"use client"

import React from "react"
import { useRegisterStore } from "@/store/register-store"
import { Button } from "@/components/ui/button"

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-10 w-10 text-primary"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
)

export function StepSuccess() {
  const resetRegisterFlow = useRegisterStore((state) => state.resetRegisterFlow)

  return (
    <div className="flex animate-in flex-col items-center space-y-6 py-4 text-center duration-300 fade-in">
      <div className="flex size-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
        <CheckIcon />
      </div>

      <div className="mx-auto w-full max-w-sm space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Аккаунт успешно создан
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Можно перейти ко входу и начать работу в личном кабинете.
        </p>
      </div>

      <Button
        onClick={() => resetRegisterFlow()}
        className="h-12 w-full rounded-2xl"
      >
        Перейти ко входу
      </Button>
    </div>
  )
}
