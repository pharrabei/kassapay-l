"use client"

import React, { useMemo, useState } from "react"
import { useRegisterStore } from "@/store/register-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function generateCaptchaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: 5 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

export function StepPhone() {
  const { updateData, setStep } = useRegisterStore()
  const [phone, setPhone] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [captchaCode] = useState(generateCaptchaCode)

  const captchaDisplay = useMemo(
    () => captchaCode.split("").join(" "),
    [captchaCode]
  )

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, "")

    if (value.length === 0) {
      setPhone("")
      return
    }

    if (value === "8") {
      value = "7"
    } else if (value.startsWith("8")) {
      value = "7" + value.slice(1)
    } else if (!value.startsWith("7")) {
      value = "7" + value
    }

    value = value.slice(0, 11)

    let formatted = ""
    if (value.length > 0) {
      formatted = "+7"
      if (value.length > 1) {
        formatted += " (" + value.slice(1, 4)
      }
      if (value.length > 4) {
        formatted += ") " + value.slice(4, 7)
      }
      if (value.length > 7) {
        formatted += " " + value.slice(7, 9)
      }
      if (value.length > 9) {
        formatted += " " + value.slice(9, 11)
      }
    }

    setPhone(formatted)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!phone || phone.length < 16) {
      newErrors.phone = "Введите корректный номер телефона"
    }

    if (!captchaInput.trim()) {
      newErrors.captcha = "Введите код с изображения"
    } else if (captchaInput.trim().toUpperCase() !== captchaCode) {
      newErrors.captcha = "Неверный код проверки"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return
    updateData({ phone })
    setStep(2)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          Номер телефона
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___ __ __"
          value={phone}
          onChange={handlePhoneChange}
          aria-invalid={!!errors.phone}
          className="h-12 rounded-2xl"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha" className="text-sm font-medium">
          Проверка
        </Label>
        <div
          className="flex h-16 w-full items-center justify-center rounded-2xl border border-border bg-muted tracking-[0.35em] text-lg font-semibold text-foreground select-none"
          aria-hidden="true"
        >
          {captchaDisplay}
        </div>
        <Input
          id="captcha"
          type="text"
          placeholder="Введите символы с картинки"
          value={captchaInput}
          onChange={(event) =>
            setCaptchaInput(event.target.value.toUpperCase())
          }
          aria-invalid={!!errors.captcha}
          className="h-12 rounded-2xl uppercase"
          maxLength={5}
        />
        {errors.captcha && (
          <p className="text-sm text-destructive">{errors.captcha}</p>
        )}
      </div>

      <Button onClick={handleNext} className="h-12 w-full rounded-2xl">
        Далее
      </Button>
    </div>
  )
}
