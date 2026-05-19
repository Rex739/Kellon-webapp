"use client";

import { useRouter } from "next/navigation";
import WebOnboarding from "./Onboarding";

export default function OnboardingPageClient() {
  const router = useRouter();

  const handleFinish = () => {
    document.cookie =
      "kellon_onboarded=true; path=/; max-age=31536000; SameSite=Lax";

    const hasSession = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="));

    if (hasSession) {
      router.replace("/");
    } else {
      router.replace("/continue");
    }
  };

  return <WebOnboarding onComplete={handleFinish} />;
}
