"use client"

import { useRouter } from "next/navigation"
import WebOnboarding from "@/components/Onboarding"

export default function OnboardingPage() {
  const router = useRouter()

  const handleFinish = () => {
    /**
     * ✅ Set onboarding cookie
     * This "unlocks" the middleware's first gate.
     */
    document.cookie =
      "kellon_onboarded=true; path=/; max-age=31536000; SameSite=Lax"

    /**
     * 🧠 Intelligent Handoff:
     * We check if the user already has a session cookie from the backend.
     * If they do, we skip the /continue (login) screen and go home.
     */
    const hasSession = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="))

    if (hasSession) {
      router.replace("/")
    } else {
      router.replace("/continue")
    }
  }

  return <WebOnboarding onComplete={handleFinish} />
}
