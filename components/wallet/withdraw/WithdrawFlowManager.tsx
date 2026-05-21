"use client";

import { useRouter } from "next/navigation";
import type { User } from "@/types/db";
import WithdrawFlow from "./WithdrawFlow";

export default function WithdrawFlowManager({ profile }: { profile: User }) {
  const router = useRouter();

  const handleAttemptClose = (hasStarted: boolean) => {
    if (hasStarted) {
      router.push("/");
    } else {
      router.push("/");
    }
  };

  return <WithdrawFlow profile={profile} onAttemptClose={handleAttemptClose} />;
}
