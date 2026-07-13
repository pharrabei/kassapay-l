"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Alias of the main auth entry — client redirect (works with static export). */
export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return null
}
