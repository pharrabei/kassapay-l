"use client"

import React, { memo } from "react"
import Image from "next/image"
import { LoadingBlock } from "@/components/ui/loading-block"
import { withBasePath } from "@/lib/base-path"
import { useRegisterStore, type RegisterStep } from "@/store/register-store"
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
      className={`w-[min(100%,11.5rem)] rounded-2xl border border-white/10 bg-white/10 p-3.5 text-left text-white shadow-2xl shadow-black/10 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-0.5 lg:w-52 lg:rounded-3xl lg:p-4 ${className}`}
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

      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl px-5 py-7 text-center text-white sm:gap-8 sm:px-8 lg:px-10">
        <div className="flex w-full max-w-lg flex-col items-center gap-4 animate-in duration-500 fade-in slide-in-from-top-3">
          <div className="inline-flex h-12 items-center rounded-2xl border border-white/10 bg-white/10 px-4 backdrop-blur-xl">
            <Image
              src={withBasePath("/Logo.svg")}
              alt="KassaPay"
              width={150}
              height={34}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>

          <h2 className="text-balance text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Платежи, касса и продажи в одной системе
          </h2>
        </div>

        <div className="relative mx-auto flex min-h-0 w-full max-w-xl flex-1 items-center justify-center px-2">
          <div className="absolute size-[min(58%,16rem)] rounded-full border border-white/10 bg-white/5" />
          <div className="absolute size-[min(42%,11rem)] rounded-full border border-white/10 bg-white/10" />
          <div className="absolute size-24 rounded-full bg-emerald-400/20 blur-xl" />

          <Image
            src={withBasePath("/maininf.png")}
            alt=""
            width={480}
            height={480}
            className="relative z-10 mx-auto h-auto max-h-[min(42dvh,320px)] w-auto max-w-[min(100%,280px)] object-contain drop-shadow-2xl"
            priority
          />

          <HeroStatCard
            title="QR-оплата"
            text="Kaspi QR и карты без лишних шагов."
            className="absolute top-[6%] left-0 z-20 sm:top-[10%]"
          />

          <HeroStatCard
            title="PDF-счета"
            text="Счета для юридических лиц и быстрых оплат."
            className="absolute top-[34%] right-0 z-20 sm:top-[38%]"
          />

          <HeroStatCard
            title="Аналитика"
            text="Продажи, сотрудники и объекты в понятных отчетах."
            className="absolute bottom-[4%] left-[4%] z-20 sm:bottom-[8%] sm:left-[8%]"
          />
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
