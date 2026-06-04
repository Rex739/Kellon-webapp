import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlowReviewRowProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  variant?: "plain" | "card";
}

export function FlowReviewRow({
  label,
  value,
  highlight,
  variant = "plain",
}: FlowReviewRowProps) {
  if (variant === "card") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-80 bg-gray-95 px-4 py-3 dark:border-white/10 dark:bg-secondary-60/25">
        <span className="text-xs font-medium text-gray-20 dark:text-gray-40">
          {label}
        </span>
        <span
          className={cn(
            "min-w-0 truncate text-right text-sm font-semibold text-black dark:text-white",
            highlight && "text-primary-60 dark:text-primary-80",
          )}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-5 pb-4">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={cn(
          "max-w-[60%] text-right text-sm font-bold text-black dark:text-white",
          highlight && "text-primary-60 dark:text-primary-80",
        )}
      >
        {value}
      </span>
    </div>
  );
}
