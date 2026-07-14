"use client"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import {
  useRegisterStore,
  type TariffPeriod,
  type TariffPlan,
} from "@/store/register-store"
import { Button } from "@/components/ui/button"
import { LoadingBlock } from "@/components/ui/loading-block"
import { withBasePath } from "@/lib/base-path"

interface TariffOption {
  id: TariffPlan
  name: string
  description: string
  monthlyPrice: number | null
  features: string[]
  highlighted?: boolean
}

interface PeriodOption {
  id: TariffPeriod
  label: string
  months: number
  discount: number
}

const PERIODS: PeriodOption[] = [
  { id: "1m", label: "1 мес", months: 1, discount: 0 },
  { id: "3m", label: "3 мес", months: 3, discount: 5 },
  { id: "6m", label: "6 мес", months: 6, discount: 10 },
  { id: "12m", label: "1 год", months: 12, discount: 15 },
]

const TARIFFS: TariffOption[] = [
  {
    id: "START",
    name: "Start",
    description: "Базовый набор для запуска продаж",
    monthlyPrice: 15000,
    features: [
      "До 1 объекта",
      "До 2 сотрудников",
      "Базовые отчеты",
      "Оффлайн продажа",
      "Поддержка",
    ],
  },
  {
    id: "BUSINESS",
    name: "Business",
    description: "Для растущей команды и онлайн-продаж",
    monthlyPrice: 35000,
    features: [
      "До 2 объектов",
      "До 4 сотрудников",
      "Расширенные отчеты",
      "Kaspi POS, платежи",
      "Мобильная фиксация",
      "Модуль экскурсовода",
      "Онлайн продажи",
    ],
    highlighted: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "Для сети объектов и глубокой аналитики",
    monthlyPrice: null,
    features: [
      "До 4 объектов и больше",
      "До 8 сотрудников и больше",
      "Все виды отчетов, глубокая аналитика",
      "Kaspi POS, платежи",
      "Турникеты",
      "Камеры подсчета посетителей",
      "Приоритетная поддержка",
    ],
  },
]

const formatTenge = (value: number) =>
  new Intl.NumberFormat("ru-KZ").format(value) + " ₸"

function getPeriodPrice(plan: TariffOption, period: PeriodOption) {
  if (!plan.monthlyPrice) return null

  const base = plan.monthlyPrice * period.months
  const discounted = Math.round(base * (1 - period.discount / 100))

  return {
    base,
    total: discounted,
    monthly: Math.round(discounted / period.months),
    savings: base - discounted,
  }
}

export function StepTariffs() {
  const { setAuthMode, setStep, updateData } = useRegisterStore()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = React.useState<TariffPeriod>("1m")
  const [isPending, setIsPending] = React.useState(false)

  const period =
    PERIODS.find((option) => option.id === selectedPeriod) ?? PERIODS[0]

  const handleSelectTariff = async (tariff: TariffPlan) => {
    setIsPending(true)
    updateData({ tariff, tariffPeriod: selectedPeriod })
    await new Promise((resolve) => setTimeout(resolve, 700))
    setStep(5)
    setIsPending(false)
  }

  const handleClose = async () => {
    setIsPending(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    setAuthMode("login")
    setStep(0)
    router.replace("/")
  }

  return (
    <div
      className="fixed inset-0 z-50 animate-in overflow-y-auto bg-background/95 backdrop-blur-xl duration-200 fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tariffs-title"
    >
      {isPending && (
        <LoadingBlock fullScreen label="Подключаем тариф..." />
      )}

      <div className="min-h-[100dvh] px-5 py-5 md:px-8 md:py-7">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <Image
                src={withBasePath("/Logo.svg?v=5")}
                alt="KassaPay"
                width={150}
                height={34}
                className="h-8 w-auto object-contain"
                priority
              />
              <h2
                id="tariffs-title"
                className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl"
              >
                Выберите тариф
              </h2>
            </div>

            <div className="inline-grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/40 p-1 sm:grid-cols-4">
              {PERIODS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedPeriod(option.id)}
                  disabled={isPending}
                  className={`min-h-10 rounded-xl px-3 text-sm font-medium transition-all ${
                    selectedPeriod === option.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{option.label}</span>
                  {option.discount > 0 && (
                    <span className="ml-1 text-xs text-primary">
                      -{option.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-full border border-border bg-background/80 shadow-sm transition-transform hover:scale-105"
            aria-label="Закрыть тарифы"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-7xl grid-cols-1 gap-4 md:mt-24 lg:grid-cols-3">
          {TARIFFS.map((plan, index) => {
            const price = getPeriodPrice(plan, period)

            return (
              <article
                key={plan.id}
                className={`relative flex min-h-0 animate-in flex-col rounded-3xl border p-6 shadow-sm transition-all duration-300 fade-in slide-in-from-bottom-4 hover:-translate-y-0.5 hover:shadow-xl md:min-h-[520px] ${
                  plan.highlighted
                    ? "border-primary/60 bg-primary/[0.07] shadow-primary/10"
                    : "border-border bg-card"
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {plan.highlighted && (
                  <span className="absolute top-5 right-5 z-10 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Популярный
                  </span>
                )}

                {plan.id === "BUSINESS" && (
                  <div className="pointer-events-none absolute -top-20 left-1/2 z-20 hidden h-36 w-52 -translate-x-1/2 items-center justify-center md:flex">
                    <Image
                      src={withBasePath("/3D.png")}
                      alt=""
                      width={320}
                      height={220}
                      className="h-full w-auto object-contain drop-shadow-2xl"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="pr-28 text-2xl font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-7 space-y-1">
                  {price ? (
                    <>
                      <p className="text-4xl font-semibold tracking-tight">
                        {formatTenge(price.total)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTenge(price.monthly)} / мес
                        {period.months > 1 && `, оплата за ${period.label}`}
                      </p>
                      {price.savings > 0 && (
                        <p className="text-sm font-medium text-primary">
                          Экономия {formatTenge(price.savings)}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-semibold tracking-tight">
                        По запросу
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Индивидуальная стоимость и условия
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-5 text-foreground"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectTariff(plan.id)}
                  loading={isPending}
                  className="mt-auto h-12 w-full rounded-2xl text-sm font-medium transition-transform hover:-translate-y-0.5"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Выбрать
                </Button>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
