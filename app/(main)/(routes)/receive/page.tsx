import ReceiveCrypto from "@/components/wallet/receive/ReceiveCrypto";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { FC } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receive Crypto",
  description:
    "Receive crypto into your Kellon wallet with the right chain address and network details.",
  alternates: {
    canonical: "/receive",
  },
};

const page: FC = async () => {
  const profile = await currentProfile();
  if (!profile) redirect("/");

  const chainAccounts = profile.chainAccounts ?? [];
  return (
    <main className="min-h-[100dvh]">
      <ReceiveCrypto chainAccounts={chainAccounts} />
    </main>
  );
};

export default page;
