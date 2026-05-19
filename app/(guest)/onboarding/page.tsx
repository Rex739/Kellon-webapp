import type { Metadata } from "next";
import OnboardingPageClient from "@/components/guest/OnboardingPageClient";

export const metadata: Metadata = {
  title: "Welcome",
  description:
    "Get started with Kellon for borderless payments, global investments, and one wallet that moves with you.",
  alternates: {
    canonical: "/onboarding",
  },
};

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
