"use client"

import React, { useState } from "react"
import { useRegisterStore } from "@/store/register-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StepLogin() {
  const { prevStep, updateData, setStep } = useRegisterStore()

  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!login.trim() || !password) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsLoading(false)

    updateData({ login: login.trim(), password })
    setStep(4)
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="reg-login"
            className="text-sm font-medium text-muted-foreground"
          >
            Логин
          </Label>
          <div className="rounded-2xl border border-border bg-foreground/5 p-0.5 focus-within:border-primary/70">
            <Input
              id="reg-login"
              type="text"
              placeholder="Уникальный логин"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              className="h-12 border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="reg-password"
            className="text-sm font-medium text-muted-foreground"
          >
            Пароль
          </Label>
          <div className="rounded-2xl border border-border bg-foreground/5 p-0.5 focus-within:border-primary/70">
            <Input
              id="reg-password"
              type="password"
              placeholder="Надёжный пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="h-12 flex-1 rounded-2xl"
            disabled={isLoading}
          >
            Назад
          </Button>
          <Button
            type="submit"
            className="h-12 flex-1 rounded-2xl"
            loading={isLoading}
          >
            {isLoading ? "Сохранение..." : "Далее"}
          </Button>
        </div>
      </form>
    </div>
  )
}
