"use client"

import React, { useState } from "react"
import {
  useRegisterStore,
  type PaymentMethod,
  type TariffPeriod,
  type TariffPlan,
} from "@/store/register-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { openInvoiceDocument } from "@/lib/invoice"
import { seedOnboardingFromBilling } from "@/lib/onboarding-sync"
import { toast } from "@/store/toast-store"

const PAYMENT_METHODS: {
  id: PaymentMethod
  name: string
  description: string
}[] = [
  {
    id: "KASPI_QR",
    name: "Kaspi QR",
    description: "Оплата через Kaspi",
  },
  {
    id: "CARD",
    name: "Банковская карта",
    description: "Visa, Mastercard",
  },
  {
    id: "PDF",
    name: "Счет на оплату",
    description: "PDF для юридических лиц",
  },
]

const MONTHLY_PRICES: Record<string, number> = {
  START: 15000,
  BUSINESS: 35000,
}

const PERIODS: Record<
  string,
  { label: string; months: number; discount: number }
> = {
  "1m": { label: "1 мес", months: 1, discount: 0 },
  "3m": { label: "3 мес", months: 3, discount: 5 },
  "6m": { label: "6 мес", months: 6, discount: 10 },
  "12m": { label: "1 год", months: 12, discount: 15 },
}

const formatTenge = (value: number) =>
  new Intl.NumberFormat("ru-KZ").format(value) + " ₸"

type BillingForm = {
  companyName: string
  bin: string
  bank: string
  bik: string
  account: string
  legalAddress: string
}

type BillingErrors = Partial<Record<keyof BillingForm, string>>

const emptyBilling: BillingForm = {
  companyName: "",
  bin: "",
  bank: "",
  bik: "",
  account: "",
  legalAddress: "",
}

function validateBilling(form: BillingForm): BillingErrors {
  const errors: BillingErrors = {}
  if (!form.companyName.trim()) {
    errors.companyName = "Укажите наименование организации"
  }
  if (!form.bin || form.bin.length !== 12 || !/^\d+$/.test(form.bin)) {
    errors.bin = "БИН должен состоять из 12 цифр"
  }
  if (!form.bank.trim()) errors.bank = "Укажите банк"
  if (!form.bik.trim() || form.bik.trim().length < 6) {
    errors.bik = "Укажите корректный БИК"
  }
  if (!form.account.trim() || form.account.trim().length < 10) {
    errors.account = "Укажите лицевой счёт (ИИК)"
  }
  return errors
}

export function StepPayment() {
  const { updateData, setStep, prevStep, data } = useRegisterStore()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  )
  const [showBillingDialog, setShowBillingDialog] = useState(false)
  const [billing, setBilling] = useState<BillingForm>({
    ...emptyBilling,
    companyName: data.companyName ?? "",
    bin: data.bin ?? "",
    bank: data.bank ?? "",
    bik: data.bik ?? "",
    account: data.account ?? "",
    legalAddress: data.legalAddress ?? "",
  })
  const [errors, setErrors] = useState<BillingErrors>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const period = PERIODS[data.tariffPeriod ?? "1m"] ?? PERIODS["1m"]
  const monthlyPrice = MONTHLY_PRICES[data.tariff ?? "START"]
  const amount = monthlyPrice
    ? formatTenge(
        Math.round(monthlyPrice * period.months * (1 - period.discount / 100))
      )
    : "По договору"

  function updateBillingField<K extends keyof BillingForm>(
    key: K,
    value: BillingForm[K]
  ) {
    setBilling((current) => ({ ...current, [key]: value }))
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
    }
  }

  const completePayment = async (
    method: PaymentMethod,
    billingData?: BillingForm
  ) => {
    setIsProcessing(true)
    updateData({
      paymentMethod: method,
      ...(billingData
        ? {
            companyName: billingData.companyName.trim(),
            bin: billingData.bin.trim(),
            bank: billingData.bank.trim(),
            bik: billingData.bik.trim().toUpperCase(),
            account: billingData.account.trim().toUpperCase(),
            legalAddress: billingData.legalAddress.trim(),
          }
        : {}),
    })

    if (billingData) {
      seedOnboardingFromBilling({
        companyName: billingData.companyName,
        bin: billingData.bin,
        bank: billingData.bank,
        bik: billingData.bik,
        account: billingData.account,
        legalAddress: billingData.legalAddress,
        resetCompleted: true,
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 900))
    setIsProcessing(false)
    setShowBillingDialog(false)
    toast({
      title: method === "PDF" ? "Счёт сформирован" : "Оплата прошла успешно",
      description:
        method === "PDF"
          ? "Откройте счёт и сохраните через «Печать / PDF». Реквизиты перенесены в онбординг."
          : "Тариф подключён. Можно переходить в кабинет.",
      variant: "success",
    })
    setStep(6)
  }

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method)
    if (method === "PDF") {
      setShowBillingDialog(true)
    }
  }

  const handlePay = async () => {
    if (!selectedMethod || selectedMethod === "PDF") return
    await completePayment(selectedMethod)
  }

  const handleDownloadPdf = async () => {
    const nextErrors = validateBilling(billing)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsProcessing(true)
    try {
      const payload = {
        companyName: billing.companyName.trim(),
        bin: billing.bin.trim(),
        bank: billing.bank.trim(),
        bik: billing.bik.trim().toUpperCase(),
        account: billing.account.trim().toUpperCase(),
        legalAddress: billing.legalAddress.trim(),
        tariff: (data.tariff ?? "START") as TariffPlan,
        tariffPeriod: (data.tariffPeriod ?? "1m") as TariffPeriod,
      }

      const opened = openInvoiceDocument(payload)
      if (!opened) {
        toast({
          title: "Счёт сохранён",
          description:
            "Всплывающее окно заблокировано — файл счёта скачан. Откройте его и нажмите «Печать / PDF».",
          variant: "info",
          duration: 5000,
        })
      }

      await completePayment("PDF", billing)
    } catch {
      setIsProcessing(false)
      toast({
        title: "Не удалось сформировать счёт",
        description: "Попробуйте ещё раз.",
        variant: "error",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Выбранный тариф</p>
        <p className="mt-1 text-lg font-semibold">{data.tariff ?? "-"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Период: {period.label}
          {period.discount > 0 ? `, скидка ${period.discount}%` : ""}
        </p>
        <p className="mt-2 text-sm">
          К оплате: <span className="font-semibold">{amount}</span>
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Способ оплаты</p>
        <div className="grid gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => handleSelectMethod(method.id)}
              disabled={isProcessing}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              } disabled:pointer-events-none disabled:opacity-60`}
            >
              <p className="font-medium">{method.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {method.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedMethod && selectedMethod !== "PDF" && (
        <p className="text-sm text-muted-foreground">
          {selectedMethod === "CARD"
            ? "Откроется защищенная страница оплаты."
            : "Подтвердите платеж в приложении Kaspi."}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={prevStep}
          className="h-12 flex-1 rounded-2xl"
          disabled={isProcessing}
        >
          Назад
        </Button>
        <Button
          onClick={handlePay}
          disabled={!selectedMethod || selectedMethod === "PDF"}
          loading={isProcessing}
          className="h-12 flex-1 rounded-2xl"
        >
          {isProcessing ? "Обработка..." : "Оплатить"}
        </Button>
      </div>

      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="flex max-h-[min(92dvh,860px)] w-[min(calc(100dvw-1.5rem),720px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogHeader className="space-y-2 border-b border-border px-6 py-5 pr-14 sm:px-8">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Реквизиты для счёта
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Укажите данные организации — они попадут в счёт и в шаг
              «Контрагент» онбординга.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5 sm:col-span-2">
                <Label htmlFor="companyName">Наименование организации *</Label>
                <Input
                  id="companyName"
                  className="h-11"
                  value={billing.companyName}
                  placeholder='ТОО "TM-MARKET"'
                  onChange={(event) =>
                    updateBillingField("companyName", event.target.value)
                  }
                  aria-invalid={!!errors.companyName}
                  disabled={isProcessing}
                />
                {errors.companyName ? (
                  <p className="text-sm text-destructive">{errors.companyName}</p>
                ) : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="bin">БИН *</Label>
                <Input
                  id="bin"
                  className="h-11"
                  inputMode="numeric"
                  value={billing.bin}
                  placeholder="123456789012"
                  maxLength={12}
                  onChange={(event) =>
                    updateBillingField(
                      "bin",
                      event.target.value.replace(/\D/g, "").slice(0, 12)
                    )
                  }
                  aria-invalid={!!errors.bin}
                  disabled={isProcessing}
                />
                {errors.bin ? (
                  <p className="text-sm text-destructive">{errors.bin}</p>
                ) : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="bank">Банк *</Label>
                <Input
                  id="bank"
                  className="h-11"
                  value={billing.bank}
                  placeholder="АО «Народный Банк Казахстана»"
                  onChange={(event) =>
                    updateBillingField("bank", event.target.value)
                  }
                  aria-invalid={!!errors.bank}
                  disabled={isProcessing}
                />
                {errors.bank ? (
                  <p className="text-sm text-destructive">{errors.bank}</p>
                ) : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="bik">БИК *</Label>
                <Input
                  id="bik"
                  className="h-11"
                  value={billing.bik}
                  placeholder="HSBKKZKX"
                  onChange={(event) =>
                    updateBillingField(
                      "bik",
                      event.target.value.toUpperCase().replace(/\s/g, "")
                    )
                  }
                  aria-invalid={!!errors.bik}
                  disabled={isProcessing}
                />
                {errors.bik ? (
                  <p className="text-sm text-destructive">{errors.bik}</p>
                ) : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="account">Лицевой счёт (ИИК) *</Label>
                <Input
                  id="account"
                  className="h-11"
                  value={billing.account}
                  placeholder="KZ076017191000004317"
                  onChange={(event) =>
                    updateBillingField(
                      "account",
                      event.target.value.toUpperCase().replace(/\s/g, "")
                    )
                  }
                  aria-invalid={!!errors.account}
                  disabled={isProcessing}
                />
                {errors.account ? (
                  <p className="text-sm text-destructive">{errors.account}</p>
                ) : null}
              </div>

              <div className="space-y-2.5 sm:col-span-2">
                <Label htmlFor="legalAddress">Юридический адрес</Label>
                <Input
                  id="legalAddress"
                  className="h-11"
                  value={billing.legalAddress}
                  placeholder="г. Астана, ул. Күлтегін, 14"
                  onChange={(event) =>
                    updateBillingField("legalAddress", event.target.value)
                  }
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <Button
              variant="outline"
              className="h-11 px-5"
              onClick={() => setShowBillingDialog(false)}
              disabled={isProcessing}
            >
              Отмена
            </Button>
            <Button
              className="h-11 min-w-40 px-6"
              onClick={handleDownloadPdf}
              loading={isProcessing}
            >
              {isProcessing ? "Формирование..." : "Получить счет"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
