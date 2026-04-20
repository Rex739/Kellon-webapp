import {
  Key,
  TabletSmartphone,
  Users,
  Server,
  Bell,
  Share2,
  MessageSquare,
  Shield,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react"

export const MENU_SECTIONS = (handlers: any) => [
  {
    title: "Security & Backup",
    items: [
      {
        icon: <Key className="w-4 h-4" />,
        label: "Stellar Key Recovery",
        subLabel: "Backup your secret key",
        action: () => handlers.openModal("stellar key recovery"),
      },
      {
        icon: <TabletSmartphone className="w-4 h-4" />,
        label: "Trusted Devices",
        action: () => handlers.openModal("trusted devices"),
      },
      {
        icon: <Users className="w-4 h-4" />,
        label: "Social Recovery",
        action: () => handlers.openModal("social recovery"),
      },
    ],
  },
  {
    title: "Developer",
    items: [
      {
        icon: <Server className="w-4 h-4" />,
        label: "Network Information",
        action: () => handlers.openModal("network information"),
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        icon: <Bell className="w-4 h-4" />,
        label: "Push Notifications",
        action: () => handlers.openModal("notifications"),
      },
    ],
  },
  {
    title: "Support & Community",
    items: [
      {
        icon: <Share2 className="w-4 h-4" />,
        label: "Share Kellon",
        action: handlers.handleShare,
      },
      {
        icon: <MessageSquare className="w-4 h-4" />,
        label: "Help & Support",
        action: () => handlers.openModal("help & support"),
      },
    ],
  },
  {
    title: "Legal & Information",
    isLink: true,
    items: [
      {
        icon: <Shield className="w-4 h-4" />,
        label: "Privacy Policy",
        href: "https://www.kellon.xyz/privacy-policy",
      },
      {
        icon: <FileText className="w-4 h-4" />,
        label: "Terms of Use",
        href: "https://www.kellon.xyz/terms-of-use",
      },
      {
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Disclaimer",
        href: "https://www.kellon.xyz/disclaimer",
      },
      {
        icon: <Info className="w-4 h-4" />,
        label: "About Kellon",
        href: "https://www.kellon.xyz/#about",
      },
    ],
  },
]
