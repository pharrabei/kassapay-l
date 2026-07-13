"use client"

import React, { memo } from "react"
import Image from "next/image"
import { useRegisterStore, type RegisterStep } from "@/store/register-store"
import { LoadingBlock } from "@/components/ui/loading-block"
import { StepAuth } from "./step-auth"

const StepTariffs = React.lazy(() =>
  import("./step-tariffs").then((module) => ({ default: module.StepTariffs }))
)
const StepPayment = React.lazy(() =>
  import("./step-payment").then((module) => ({ default: module.StepPayment }))
)
const StepSuccess = React.lazy(() =>
  import("./step-success").then((module) => ({ default: module.StepSuccess }))
)

const PAGE_META: Record<RegisterStep, { title: string; description: string }> =
  {
    0: {
      title: "Вход в KassaPay",
      description: "Введите логин и пароль, чтобы продолжить работу.",
    },
    1: {
      title: "Регистрация",
      description: "Подтвердите телефон и задайте данные для входа.",
    },
    2: {
      title: "Регистрация",
      description: "Подтвердите телефон и задайте данные для входа.",
    },
    3: {
      title: "Регистрация",
      description: "Подтвердите телефон и задайте данные для входа.",
    },
    4: {
      title: "Тарифы",
      description: "Выберите подходящий план и период оплаты.",
    },
    5: {
      title: "Оплата",
      description: "Завершите подключение выбранного тарифа.",
    },
    6: {
      title: "",
      description: "",
    },
  }

const HeroStatCard = memo(function HeroStatCard({
  title,
  text,
  className = "",
}: {
  title: string
  text: string
  className?: string
}) {
  return (
    <div
      className={`w-64 rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-2xl shadow-black/10 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 ${className}`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/70">{text}</p>
    </div>
  )
})

const RegisterHeroPanel = memo(function RegisterHeroPanel() {
  return (
    <section className="relative hidden min-h-0 p-4 md:block">
      <div className="absolute inset-4 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.45),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(14,165,233,0.28),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(245,158,11,0.18),transparent_36%),linear-gradient(135deg,#0b1117_0%,#12352b_48%,#071a14_100%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-3xl p-7 text-white">
        <div className="animate-in space-y-4 duration-500 fade-in slide-in-from-top-3">
          <div className="inline-flex h-14 items-center rounded-2xl border border-white/10 bg-white/10 px-4 backdrop-blur-xl">
            <Image
              src="/Logo.svg"
              alt="KassaPay"
              width={150}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>

          <div className="max-w-md space-y-1">
            <h2 className="text-4xl leading-tight font-semibold tracking-tight">
              Платежи, касса и продажи в одной системе
            </h2>
            <p className="text-sm leading-6 text-white/65">
              Подключайте тариф, принимайте оплату и управляйте объектами без
              лишних переходов.
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <div className="absolute h-64 w-64 animate-pulse rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl" />
          <div className="absolute h-44 w-44 rounded-full border border-white/10 bg-white/10 backdrop-blur-2xl" />
          <div className="absolute h-24 w-24 rounded-full bg-emerald-400/20 blur-xl" />

          <HeroStatCard
            title="QR-оплата"
            text="Kaspi QR и карты без лишних шагов."
            className="absolute top-[18%] left-0"
          />

          <HeroStatCard
            title="PDF-счета"
            text="Счета для юридических лиц и быстрых оплат."
            className="absolute top-[38%] right-0"
          />

          <HeroStatCard
            title="Аналитика"
            text="Продажи, сотрудники и объекты в понятных отчетах."
            className="absolute bottom-[16%] left-[15%]"
          />
        </div>

        <div className="animate-in rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl duration-500 fade-in slide-in-from-bottom-4">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm text-white/60">KassaPay</p>
              <p className="mt-1 text-3xl font-semibold">24/7</p>
              <p className="mt-1 text-xs text-white/50">прием платежей</p>
            </div>

            <div className="flex h-20 items-end gap-2" aria-hidden="true">
              <span className="h-8 w-3 rounded-full bg-white/25" />
              <span className="h-12 w-3 rounded-full bg-white/35" />
              <span className="h-10 w-3 rounded-full bg-white/25" />
              <span className="h-16 w-3 rounded-full bg-white/55" />
              <span className="h-20 w-3 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

function RegisterContent({ step }: { step: RegisterStep }) {
  if (step === 5) {
    return (
      <React.Suspense fallback={<LoadingBlock />}>
        <StepPayment />
      </React.Suspense>
    )
  }

  if (step === 6) {
    return (
      <React.Suspense fallback={<LoadingBlock />}>
        <StepSuccess />
      </React.Suspense>
    )
  }

  return <StepAuth />
}

export default function RegisterPage() {
  const step = useRegisterStore((state) => state.step)
  const authMode = useRegisterStore((state) => state.authMode)
  const meta =
    step === 0 && authMode === "register"
      ? {
          title: "Создание аккаунта",
          description:
            "Подтвердите телефон, затем задайте логин и пароль для входа.",
        }
      : (PAGE_META[step] ?? PAGE_META[0])

  return (
    <div className="relative h-[100dvh] w-[100dvw] overflow-hidden bg-background font-sans">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-0 items-center justify-center overflow-y-auto px-6 py-10 md:px-12">
          <div className="w-full max-w-md space-y-6">
            {meta.title || meta.description ? (
              <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-top-3">
                {meta.title ? (
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {meta.title}
                  </h1>
                ) : null}
                {meta.description ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {meta.description}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="animate-in duration-300 fade-in slide-in-from-bottom-2">
              <RegisterContent step={step} />
            </div>
          </div>
        </section>

        <RegisterHeroPanel />
      </div>

      {step === 4 && (
        <React.Suspense fallback={<LoadingBlock fullScreen />}>
          <StepTariffs />
        </React.Suspense>
      )}
    </div>
  )
}
