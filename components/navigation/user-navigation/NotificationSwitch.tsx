"use client";

import { FC, useState } from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming shadcn/ui
import toast from "react-hot-toast";

interface NotificationSwitchProps {
  initialEnabled?: boolean;
}

const NotificationSwitch: FC<NotificationSwitchProps> = ({
  initialEnabled = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      // Logic for granting/revoking browser notification permissions would go here
      setIsEnabled(checked);
      toast.success(
        checked ? "Notifications enabled" : "Notifications disabled",
      );
    } catch {
      toast.error("Failed to update notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-between p-3 hover:bg-gray-95 dark:hover:bg-secondary-60 rounded-sm transition-colors group">
      <div className="flex items-center gap-3">
        <Bell className="text-primary-70 w-4 h-4" />

        <div className="flex flex-col">
          <p className="text-xs font-bold text-black dark:text-white">
            Push Notifications
          </p>
          <p className="text-[10px] text-gray-20 dark:text-secondary-90">
            Receive transaction updates
          </p>
        </div>
      </div>

      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        className="data-[state=checked]:bg-pink-500"
      />
    </div>
  );
};

export default NotificationSwitch;
