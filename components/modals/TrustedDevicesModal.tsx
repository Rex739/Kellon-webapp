"use client";

import { FC, useEffect } from "react";
import {
  TabletSmartphone,
  ArrowLeft,
  Trash2,
  Smartphone,
  Laptop,
  Globe,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { Device as ProfileDevice, User } from "@/types/db";

interface Device {
  id: string;
  name: string;
  type: "mobile" | "desktop" | "browser";
  lastActive: string;
  isCurrent: boolean;
}

// Mock data for UI development
const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    type: "mobile",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "2",
    name: "MacBook Pro - Chrome",
    type: "desktop",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "3",
    name: "Windows PC - Edge",
    type: "browser",
    lastActive: "Yesterday",
    isCurrent: false,
  },
];

interface TrustedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: User | null;
}

const TrustedDevicesModal: FC<TrustedDevicesModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const devices = mapTrustedDevices(profile?.devices);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const DeviceIcon = ({ type }: { type: Device["type"] }) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "desktop":
        return <Laptop className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const Content = () => (
    <div className="px-4 pb-8 md:pb-0">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={onClose}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center justify-center space-y-3 mb-8">
        <div className="p-3 bg-primary-95 dark:bg-primary-70/10 rounded-full">
          <TabletSmartphone className="w-8 h-8 text-primary-70" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Trusted Devices
          </h2>
          <p className="text-sm text-gray-20 dark:text-secondary-90 max-w-[280px] mx-auto">
            Manage the devices that have access to your Kellon account.
          </p>
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
        {devices.map((device) => (
          <div
            key={device.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border transition-all",
              device.isCurrent
                ? "bg-primary-95/50 dark:bg-primary-70/5 border-primary-70/20"
                : "bg-gray-95 dark:bg-secondary-60 border-gray-80 dark:border-secondary-40",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-2.5 rounded-full",
                  device.isCurrent
                    ? "bg-primary-70 text-white"
                    : "bg-white dark:bg-secondary-40 text-gray-20 dark:text-white",
                )}
              >
                <DeviceIcon type={device.type} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
                  {device.name}
                  {device.isCurrent && (
                    <span className="text-[10px] bg-primary-70 text-white px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-gray-20 dark:text-secondary-90">
                  {device.lastActive}
                </span>
              </div>
            </div>

            {!device.isCurrent && (
              <button
                className="p-2 text-gray-20 hover:text-red-500 transition-colors"
                onClick={() => console.log("Revoke", device.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {device.isCurrent && (
              <CheckCircle2 className="w-4 h-4 text-primary-70 mr-2" />
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-80 dark:border-secondary-40">
        <p className="text-[10px] text-center text-gray-20 dark:text-secondary-90 mb-6">
          If you don&apos;t recognize a device, revoke its access immediately
          and change your security settings.
        </p>
        <Button
          onClick={onClose}
          className="w-full bg-primary-70 hover:bg-primary-70/90 text-white font-bold py-6 rounded-xl"
        >
          Done
        </Button>
      </div>
    </div>
  );

  // Using your established Mobile Drawer / Desktop Dialog pattern
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 [&>button]:hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Trusted Devices</DrawerTitle>
            <DrawerDescription>
              View and manage authorized devices
            </DrawerDescription>
          </DrawerHeader>
          <Content />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 outline-none rounded-[24px] [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Trusted Devices</DialogTitle>
          <DialogDescription>
            View and manage authorized devices
          </DialogDescription>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
};

function formatDeviceName(device: ProfileDevice): string {
  const parts = [device.brand, device.model].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (device.platform) return device.platform;
  if (device.userAgent?.toLowerCase().includes("mobile"))
    return "Mobile device";
  if (device.userAgent) return "Browser session";

  return "Trusted device";
}

function formatLastActive(value?: Date | string | null): string {
  if (!value) return "Last active recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Last active recently";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Active now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDeviceType(device: ProfileDevice): Device["type"] {
  const source =
    `${device.platform || ""} ${device.model || ""} ${device.userAgent || ""}`
      .toLowerCase()
      .trim();

  if (
    source.includes("iphone") ||
    source.includes("android") ||
    source.includes("mobile")
  ) {
    return "mobile";
  }

  if (
    source.includes("mac") ||
    source.includes("windows") ||
    source.includes("linux") ||
    source.includes("desktop")
  ) {
    return "desktop";
  }

  return "browser";
}

function mapTrustedDevices(profileDevices?: ProfileDevice[]): Device[] {
  if (!profileDevices || profileDevices.length === 0) return MOCK_DEVICES;

  return profileDevices.map((device, index) => ({
    id: device.id,
    name: formatDeviceName(device),
    type: getDeviceType(device),
    lastActive: formatLastActive(device.lastUsed),
    isCurrent: index === 0,
  }));
}

export default TrustedDevicesModal;
