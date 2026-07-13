"use client"

import React, { useState } from "react"
import { useRegisterStore } from "@/store/register-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StepPassword() {
  const { updateData, nextStep, prevStep } = useRegisterStore()
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!password || password.length < 8) {
      newErrors.password = "Пароль должен быть минимум 8 символов"
    }
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Пароли не совпадают"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = () => {
    if (validateForm()) {
      updateData({ password })
      nextStep()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">Придумайте пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="Минимум 8 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-confirm">Повторите пароль</Label>
        <Input
          id="password-confirm"
          type="password"
          placeholder="Подтвердите пароль"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          aria-invalid={!!errors.passwordConfirm}
        />
        {errors.passwordConfirm && (
          <p className="text-sm text-destructive">{errors.passwordConfirm}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Назад
        </Button>
        <Button onClick={handleRegister} className="flex-1">
          Зарегистрироваться
        </Button>
      </div>
    </div>
  )
}
