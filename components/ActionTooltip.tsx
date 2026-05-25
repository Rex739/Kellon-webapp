"use client";

import React, { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionTooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  disabled?: boolean;
}

export const ActionToolTip: FC<ActionTooltipProps> = ({
  label,
  children,
  side,
  align,
  disabled,
}) => {
  if (disabled) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="bg-white dark:bg-secondary-60 border border-input mt-2"
        >
          <p className="font-semibold text-xs capitalize text-gray-20 dark:text-gray-50">
            {label.toLowerCase()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
