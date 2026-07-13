"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ProfileData {
  fullName: string
  position: string
  phone: string
  email: string
  organization: string
  photoUrl: string
}

interface ProfileState {
  profile: ProfileData
  updateProfile: (profile: ProfileData) => void
}

const defaultProfile: ProfileData = {
  fullName: "",
  position: "",
  phone: "",
  email: "",
  organization: "",
  photoUrl: "",
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      updateProfile: (profile) => set({ profile }),
    }),
    {
      name: "kassapay-profile",
    }
  )
)
