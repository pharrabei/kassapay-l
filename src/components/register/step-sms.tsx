"use client"

import React, { useState } from "react"
import { useRegisterStore } from "@/store/register-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function StepSMS() {
  const { updateData, setStep, prevStep, data } = useRegisterStore()
  const [smsCode, setSmsCode] = useState("")
  const [error, setError] = useState("")

  const handleCodeChange = (value: string) => {
    const normalized = value.toUpperCase().slice(0, 4)
    setSmsCode(normalized)
    setError("")

    if (normalized.length === 4) {
      updateData({ smsCode: normalized })
      setStep(3)
    }
  }

  const handleConfirm = () => {
    if (smsCode.length < 4) {
      setError("Введите 4-значный код")
      return
    }

    updateData({ smsCode })
    setStep(3)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Код из SMS</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Отправлен на номер {data.phone ?? "ваш телефон"}
          </p>
        </div>

        <div className="flex justify-center py-2">
          <InputOTP
            maxLength={4}
            value={smsCode}
            onChange={handleCodeChange}
            containerClassName="gap-3"
          >
            <InputOTPGroup className="gap-3">
              {[0, 1, 2, 3].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-14 w-14 rounded-2xl border-border text-xl font-semibold first:rounded-2xl last:rounded-2xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={prevStep}
          className="h-12 flex-1 rounded-2xl"
        >
          Назад
        </Button>
        <Button onClick={handleConfirm} className="h-12 flex-1 rounded-2xl">
          Подтвердить
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Не пришёл код?{" "}
        <button
          type="button"
          className="font-medium text-primary hover:underline"
        >
          Отправить снова
        </button>
      </p>
    </div>
  )
}
