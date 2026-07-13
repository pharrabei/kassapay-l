"use client"

import React, { type ReactNode, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useRegisterStore } from "@/store/register-store"
import { getDashboardPath } from "@/lib/routing"
import {
  getFirstIncompleteStep,
  seedOnboardingFromRegister,
} from "@/lib/onboarding-sync"
import { Button } from "@/components/ui/button"
import {
  isOnboardingComplete,
  useOnboardingStore,
} from "@/store/onboarding-store"
import { toast } from "@/store/toast-store"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {open ? (
      <>
        <path d="M1 1l22 22" />
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7.18 0-11-6-11-8 0-1.12.6-2.56 1.65-3.9" />
        <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
        <path d="M10.73 5.08A10.66 10.66 0 0 1 12 5c7.18 0 11 6 11 7 0 .76-.28 1.67-.8 2.6" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
)

const FieldShell = ({ children }: { children: ReactNode }) => (
  <div className="group rounded-2xl border border-border bg-foreground/[0.035] transition-all duration-200 focus-within:border-primary/70 focus-within:bg-primary/[0.055] focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary),transparent_86%)]">
    {children}
  </div>
)

function generateCaptchaCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

  return Array.from({ length: 5 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

function formatPhone(value: string) {
  let digits = value.replace(/\D/g, "")

  if (digits.startsWith("8")) digits = "7" + digits.slice(1)
  if (digits && !digits.startsWith("7")) digits = "7" + digits
  digits = digits.slice(0, 11)

  if (!digits) return ""

  let formatted = "+7"
  if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`
  if (digits.length > 4) formatted += `) ${digits.slice(4, 7)}`
  if (digits.length > 7) formatted += ` ${digits.slice(7, 9)}`
  if (digits.length > 9) formatted += ` ${digits.slice(9, 11)}`

  return formatted
}

export function StepAuth() {
  const {
    authMode,
    data,
    updateData,
    setAuthMode,
    setStep,
    resetRegisterStore,
  } = useRegisterStore()
  const router = useRouter()
  const pathname = usePathname()

  const isRegister = authMode === "register"
  const [registerGatePassed, setRegisterGatePassed] = useState(false)
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [phone, setPhone] = useState("")
  const [captcha, setCaptcha] = useState("")
  const [captchaCode, setCaptchaCode] = useState(generateCaptchaCode)
  const [smsRequested, setSmsRequested] = useState(false)
  const [smsCode, setSmsCode] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const captchaDisplay = useMemo(
    () => captchaCode.split("").join(" "),
    [captchaCode]
  )

  useEffect(() => {
    if (!smsRequested || resendCooldown <= 0) return

    const timerId = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [resendCooldown, smsRequested])

  const toggleMode = () => {
    const nextIsRegister = !isRegister
    if (nextIsRegister) {
      resetRegisterStore()
    }

    setAuthMode(nextIsRegister ? "register" : "login")
    setRegisterGatePassed(false)
    setError("")
    setLogin("")
    setPassword("")
    setPasswordConfirm("")
    setPhone("")
    setCaptcha("")
    setSmsRequested(false)
    setSmsCode("")
    setResendCooldown(0)
  }

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode())
    setCaptcha("")
    setError("")
  }

  const resetPhoneCheck = () => {
    setRegisterGatePassed(false)
    setSmsRequested(false)
    setSmsCode("")
    setResendCooldown(0)
    setError("")
  }

  const resendSmsCode = async () => {
    if (resendCooldown > 0 || isLoading) return

    setError("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsLoading(false)
    setSmsCode("")
    setResendCooldown(60)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (isRegister) {
      if (!registerGatePassed) {
        if (!smsRequested) {
          if (!phone || phone.length < 16) {
            setError("Введите корректный номер телефона.")
            return
          }

          if (captcha.trim().toUpperCase() !== captchaCode) {
            setError("Введите код с картинки.")
            return
          }

          setIsLoading(true)
          await new Promise((resolve) => setTimeout(resolve, 800))
          setIsLoading(false)
          setSmsRequested(true)
          setResendCooldown(60)
          setError("")
          return
        }

        if (smsCode.length < 4) {
          setError("Введите SMS-код.")
          return
        }

        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 800))
        setIsLoading(false)
        setRegisterGatePassed(true)
        setError("")
        return
      }
    }

    if (!login.trim() || !password) {
      setError("Заполните логин и пароль.")
      return
    }

    if (isRegister) {
      if (password.length < 8) {
        setError("Пароль должен быть минимум 8 символов.")
        return
      }

      if (password !== passwordConfirm) {
        setError("Пароли не совпадают.")
        return
      }
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsLoading(false)

    if (isRegister) {
      updateData({ login: login.trim(), password, phone })
      toast({
        title: "Аккаунт создан",
        description: "Выберите тариф для продолжения.",
        variant: "success",
      })
      setStep(4)
      return
    }

    if (!data.paymentMethod) {
      updateData({ login: login.trim(), password })
      toast({
        title: "Нужна оплата тарифа",
        description: "Завершите подключение, чтобы войти в кабинет.",
        variant: "info",
      })
      setStep(data.tariff ? 5 : 4)
      return
    }

    seedOnboardingFromRegister(data)
    const completed = useOnboardingStore.getState().completedStepIds
    if (!isOnboardingComplete(completed)) {
      useOnboardingStore
        .getState()
        .setCurrentStep(getFirstIncompleteStep(completed))
    }

    toast({
      title: "Добро пожаловать",
      description: isOnboardingComplete(completed)
        ? "Вы успешно вошли в систему."
        : "Завершите онбординг, чтобы запустить продажи.",
      variant: "success",
    })
    router.push(getDashboardPath(pathname))
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="animate-in space-y-5 duration-300 fade-in slide-in-from-bottom-3"
      >
        {isRegister && (
          <>
            {!registerGatePassed && !smsRequested && (
              <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-phone"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Номер телефона
                  </Label>
                  <FieldShell>
                    <Input
                      id="reg-phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+7 (700) 123 45 67"
                      value={phone}
                      onChange={(event) =>
                        setPhone(formatPhone(event.target.value))
                      }
                      className="h-12 rounded-2xl border-0 bg-transparent px-4 shadow-none outline-none focus-visible:ring-0"
                      required
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                  </FieldShell>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-captcha"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Код с картинки
                  </Label>
                  <div className="flex gap-3">
                    <FieldShell>
                      <Input
                        id="reg-captcha"
                        type="text"
                        value={captcha}
                        placeholder="Введите код"
                        onChange={(event) =>
                          setCaptcha(event.target.value.toUpperCase())
                        }
                        className="h-12 rounded-2xl border-0 bg-transparent px-4 text-sm uppercase shadow-none outline-none focus-visible:ring-0"
                        required
                        disabled={isLoading}
                        maxLength={5}
                      />
                    </FieldShell>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="flex h-12 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/70 px-2 font-mono text-sm font-semibold tracking-[0.18em] whitespace-nowrap text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10"
                      aria-label="Обновить капчу"
                      disabled={isLoading}
                    >
                      {captchaDisplay}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!registerGatePassed && smsRequested && (
              <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    SMS-код
                  </Label>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Код отправлен на номер {phone}
                  </p>
                </div>

                <div className="flex justify-center py-1">
                  <InputOTP
                    maxLength={4}
                    value={smsCode}
                    onChange={(value) =>
                      setSmsCode(value.replace(/\D/g, "").slice(0, 4))
                    }
                    disabled={isLoading}
                  >
                    <InputOTPGroup className="gap-3">
                      {[0, 1, 2, 3].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-12 w-12 rounded-2xl border border-border bg-foreground/[0.035] text-lg font-semibold first:rounded-2xl last:rounded-2xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={resetPhoneCheck}
                    className="text-sm font-medium text-primary transition-colors hover:underline"
                    disabled={isLoading}
                  >
                    Изменить номер
                  </button>

                  <button
                    type="button"
                    onClick={resendSmsCode}
                    className="text-sm font-medium text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                    disabled={isLoading || resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Отправить снова через ${resendCooldown} сек`
                      : "Отправить снова"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {(!isRegister || registerGatePassed) && (
          <>
            <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-bottom-2">
              <Label
                htmlFor="auth-login"
                className="text-sm font-medium text-muted-foreground"
              >
                Логин
              </Label>
              <FieldShell>
                <Input
                  id="auth-login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  className="h-12 rounded-2xl border-0 bg-transparent px-4 shadow-none outline-none focus-visible:ring-0"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </FieldShell>
            </div>

            <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-bottom-2">
              <Label
                htmlFor="auth-password"
                className="text-sm font-medium text-muted-foreground"
              >
                Пароль
              </Label>
              <FieldShell>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isRegister ? "Минимум 8 символов" : "Введите пароль"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 rounded-2xl border-0 bg-transparent px-4 pr-12 shadow-none outline-none focus-visible:ring-0"
                    required
                    disabled={isLoading}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? "Скрыть пароль" : "Показать пароль"
                    }
                    disabled={isLoading}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </FieldShell>
            </div>

            {isRegister && (
              <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-bottom-2">
                <Label
                  htmlFor="reg-password-confirm"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Повторите пароль
                </Label>
                <FieldShell>
                  <Input
                    id="reg-password-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Повторите пароль"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    className="h-12 rounded-2xl border-0 bg-transparent px-4 shadow-none outline-none focus-visible:ring-0"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </FieldShell>
              </div>
            )}
          </>
        )}

        {!isRegister && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm text-primary"
              disabled={isLoading}
            >
              Забыли пароль?
            </Button>
          </div>
        )}

        {error && (
          <p className="animate-in text-sm text-destructive fade-in slide-in-from-top-1">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl text-sm font-medium transition-transform hover:-translate-y-0.5"
          loading={isLoading}
        >
          {isRegister && !registerGatePassed && !smsRequested
            ? "Получить SMS-код"
            : isRegister && !registerGatePassed
              ? "Подтвердить код"
              : isRegister
                ? "Создать аккаунт"
                : "Войти"}
        </Button>
      </form>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        {isRegister ? "Есть аккаунт?" : "Нет аккаунта?"}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="font-medium text-primary transition-colors hover:underline"
          disabled={isLoading}
        >
          {isRegister ? "Войти" : "Создать аккаунт"}
        </button>
      </p>
    </div>
  )
}
