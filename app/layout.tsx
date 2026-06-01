import type { Metadata, Viewport } from "next";
import "./globals.css";
import Provider from "@/components/providers/Provider";
import { initLifiConfig } from "@/lib/lifi-config";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kellon.xyz"),
  title: {
    default: "Kellon - Borderless Payments. Global Investments. One Wallet",
    template: "%s | Kellon",
  },
  description:
    "Kellon Mobile enables borderless payments and global investments through one powerful financial platform. Break financial barriers with seamless cross-border transactions.",
  manifest: "/manifest.json",
  applicationName: "Kellon",
  keywords: [
    "Kellon",
    "borderless payments",
    "global investments",
    "wallet",
    "crypto wallet",
    "cross-border payments",
    "stablecoin payments",
    "send money",
    "receive crypto",
    "buy crypto",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.kellon.xyz/",
    siteName: "Kellon",
    title: "Kellon - Borderless Payments. Global Investments. One Wallet",
    description:
      "Kellon Mobile enables borderless payments and global investments through one powerful financial platform. Break financial barriers with seamless cross-border transactions.",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "Kellon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Kellon - Borderless Payments. Global Investments. One Wallet",
    description:
      "Kellon Mobile enables borderless payments and global investments through one powerful financial platform. Break financial barriers with seamless cross-border transactions.",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Kellon",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a"
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initLifiConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
