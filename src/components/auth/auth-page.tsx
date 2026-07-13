"use client"

import { type ReactNode, useMemo, useState } from "react"
import Image from "next/image"
import { useRegisterStore } from "@/store/register-store"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  getFirstIncompleteStep,
  seedOnboardingFromRegister,
} from "@/lib/onboarding-sync"
import {
  isOnboardingComplete,
  useOnboardingStore,
} from "@/store/onboarding-store"
import { withBasePath } from "@/lib/base-path"
import { navigateHard } from "@/lib/routing"
import { toast } from "@/store/toast-store"

const FieldShell = ({ children }: { children: ReactNode }) => (
  <div className="group rounded-2xl border border-border bg-foreground/[0.035] transition-all duration-200 focus-within:border-primary/70 focus-within:bg-primary/[0.055] focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary),transparent_86%)]">
    {children}
  </div>
)

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

const HeroStatCard = ({
  title,
  text,
  className = "",
}: {
  title: string
  text: string
  className?: string
}) => (
  <div
    className={`w-64 rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-2xl shadow-black/10 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 ${className}`}
  >
    <p className="text-sm font-medium">{title}</p>
    <p className="mt-1 text-xs leading-5 text-white/70">{text}</p>
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

export function AuthPage() {
  const { data, updateData, setStep, resetRegisterStore } = useRegisterStore()

  const [isRegister, setIsRegister] = useState(false)
  const [registerGatePassed, setRegisterGatePassed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [phone, setPhone] = useState("")
  const [captcha, setCaptcha] = useState("")
  const [captchaCode, setCaptchaCode] = useState(generateCaptchaCode)
  const [smsRequested, setSmsRequested] = useState(false)
  const [smsCode, setSmsCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const captchaDisplay = useMemo(
    () => captchaCode.split("").join(" "),
    [captchaCode]
  )

  const handleToggleMode = () => {
    const nextIsRegister = !isRegister
    if (nextIsRegister) {
      resetRegisterStore()
    }

    setIsRegister(nextIsRegister)
    setRegisterGatePassed(false)
    setError("")
    setLogin("")
    setPassword("")
    setPasswordConfirm("")
    setPhone("")
    setCaptcha("")
    setSmsRequested(false)
    setSmsCode("")
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
    setError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (isRegister && !registerGatePassed) {
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
      return
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

    updateData({
      login: login.trim(),
      password,
      ...(isRegister ? { phone } : {}),
    })

    if (isRegister) {
      toast({
        title: "Аккаунт создан",
        description: "Выберите тариф для продолжения.",
        variant: "success",
      })
      setStep(4)
      navigateHard("/")
      return
    }

    if (!data.paymentMethod) {
      toast({
        title: "Нужна оплата тарифа",
        description: "Завершите подключение, чтобы войти в кабинет.",
        variant: "info",
      })
      setStep(data.tariff ? 5 : 4)
      navigateHard("/")
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
    setStep(0)
    navigateHard("/dashboard")
  }

  return (
    <div className="h-[100dvh] w-[100dvw] overflow-hidden bg-background font-sans">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-0 items-center justify-center px-6 py-10 md:px-12">
          <div className="w-full max-w-md space-y-6">
            <div className="animate-in space-y-2.5 duration-300 fade-in slide-in-from-top-3">
              <h1 className="text-4xl font-semibold tracking-tighter text-foreground md:text-5xl">
                <span className="font-light">
                  {isRegister ? "Создать аккаунт" : "Добро пожаловать"}
                </span>
              </h1>

              <p className="text-sm leading-6 text-muted-foreground">
                {isRegister
                  ? registerGatePassed
                    ? "Теперь придумайте логин и надежный пароль."
                    : smsRequested
                      ? "Введите SMS-код, отправленный на ваш номер."
                      : "Сначала подтвердите номер телефона кодом с картинки."
                  : "Войдите в свой аккаунт и продолжите работу."}
              </p>
            </div>

            <Card
              className="border-0 bg-transparent shadow-none"
              style={{
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            >
              <CardContent className="space-y-5 p-0">
                <form
                  className="animate-in space-y-5 duration-300 fade-in slide-in-from-bottom-4"
                  onSubmit={handleSubmit}
                >
                  {isRegister && !registerGatePassed && !smsRequested && (
                    <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-bottom-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Номер телефона
                        </Label>
                        <FieldShell>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            placeholder="+7 (700) 123 45 67"
                            onChange={(event) =>
                              setPhone(formatPhone(event.target.value))
                            }
                            className="h-12 rounded-2xl border-0 bg-transparent px-4 text-sm shadow-none outline-none focus-visible:ring-0"
                            required
                            disabled={isLoading}
                            autoComplete="tel"
                          />
                        </FieldShell>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="captcha"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Код с картинки
                        </Label>
                        <div className="flex gap-3">
                          <FieldShell>
                            <Input
                              id="captcha"
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

                  {isRegister && !registerGatePassed && smsRequested && (
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

                      <button
                        type="button"
                        onClick={resetPhoneCheck}
                        className="text-sm font-medium text-primary transition-colors hover:underline"
                        disabled={isLoading}
                      >
                        Изменить номер
                      </button>
                    </div>
                  )}

                  {(!isRegister || registerGatePassed) && (
                    <>
                      <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-bottom-2">
                        <Label
                          htmlFor="login"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Логин
                        </Label>
                        <FieldShell>
                          <Input
                            id="login"
                            type="text"
                            value={login}
                            placeholder="Введите логин"
                            onChange={(event) => setLogin(event.target.value)}
                            className="h-12 rounded-2xl border-0 bg-transparent px-4 text-sm shadow-none outline-none focus-visible:ring-0"
                            required
                            disabled={isLoading}
                            autoComplete="username"
                          />
                        </FieldShell>
                      </div>

                      <div className="animate-in space-y-2 duration-300 fade-in slide-in-from-bottom-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Пароль
                        </Label>
                        <FieldShell>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              placeholder={
                                isRegister
                                  ? "Минимум 8 символов"
                                  : "Введите пароль"
                              }
                              onChange={(event) =>
                                setPassword(event.target.value)
                              }
                              className="h-12 rounded-2xl border-0 bg-transparent px-4 pr-12 text-sm shadow-none outline-none focus-visible:ring-0"
                              required
                              disabled={isLoading}
                              autoComplete={
                                isRegister ? "new-password" : "current-password"
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={
                                showPassword
                                  ? "Скрыть пароль"
                                  : "Показать пароль"
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
                            htmlFor="password-confirm"
                            className="text-sm font-medium text-muted-foreground"
                          >
                            Повторите пароль
                          </Label>
                          <FieldShell>
                            <Input
                              id="password-confirm"
                              type={showPassword ? "text" : "password"}
                              value={passwordConfirm}
                              placeholder="Повторите пароль"
                              onChange={(event) =>
                                setPasswordConfirm(event.target.value)
                              }
                              className="h-12 rounded-2xl border-0 bg-transparent px-4 text-sm shadow-none outline-none focus-visible:ring-0"
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
                        className="h-auto p-0 text-sm font-medium text-primary"
                        disabled={isLoading}
                      >
                        Сбросить пароль
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

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  {isRegister ? "Есть учетная запись?" : "Нет учетной записи?"}{" "}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="font-medium text-primary transition-colors hover:underline"
                    disabled={isLoading}
                  >
                    {isRegister ? "Войти" : "Создать аккаунт"}
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="relative hidden min-h-0 p-4 md:block">
          <div className="absolute inset-4 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.45),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(14,165,233,0.28),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(245,158,11,0.18),transparent_36%),linear-gradient(135deg,#0b1117_0%,#12352b_48%,#071a14_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-3xl p-7 text-white">
            <div className="animate-in space-y-4 duration-500 fade-in slide-in-from-top-3">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium tracking-[0.22em] text-white/70 uppercase backdrop-blur-xl">
                KassaPay
              </div>

              <div className="max-w-md space-y-1">
                <h2 className="text-4xl leading-tight font-semibold tracking-tight">
                  Создайте рабочее пространство
                </h2>

                <p className="text-sm leading-6 text-white/65">
                  Управляйте платежами, счетами и продажами из единой панели.
                </p>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-0" />
              <div className="absolute h-52 w-52 rounded-full border border-white/10 bg-white/10" />
              <div className="absolute h-28 w-28 rounded-full bg-emerald-400/20 blur-xl" />

              <Image
                src={withBasePath("/maininf.png")}
                alt=""
                width={480}
                height={480}
                className="relative z-10 h-auto w-[min(100%,300px)] object-contain drop-shadow-2xl"
                priority
              />

              <HeroStatCard
                title="QR-платежи"
                text="Быстрый и простой процесс оплаты."
                className="absolute top-[12%] left-0 z-20"
              />

              <HeroStatCard
                title="PDF-счета"
                text="Генерируйте документы мгновенно."
                className="absolute top-[36%] right-0 z-20"
              />

              <HeroStatCard
                title="Продажи"
                text="Отслеживайте продажи и активность партнеров."
                className="absolute bottom-[12%] left-[12%] z-20"
              />
            </div>

            <div className="animate-in rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl duration-500 fade-in slide-in-from-bottom-4">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-sm text-white/60">Сегодня</p>
                  <p className="mt-1 text-3xl font-semibold">+24%</p>
                  <p className="mt-1 text-xs text-white/50">рост продаж</p>
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
      </div>
    </div>
  )
}
