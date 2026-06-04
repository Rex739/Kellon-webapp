import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlowEmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  textClassName?: string;
  align?: "center" | "left";
}

export default function FlowEmptyState({
  icon,
  title,
  text,
  action,
  className,
  iconClassName,
  titleClassName,
  textClassName,
  align = "center",
}: FlowEmptyStateProps) {
  const isLeftAligned = align === "left";

  return (
    <div
      className={cn(
        "flex flex-col justify-center rounded-2xl border border-dashed border-gray-80 bg-gray-95 p-8 text-center dark:border-white/10 dark:bg-secondary-60/20",
        isLeftAligned && "items-start text-left",
        !isLeftAligned && "items-center",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary-90/50 bg-primary-99 text-primary-50 dark:border-white/5 dark:bg-white/5 dark:text-primary-80 md:mb-5 md:h-14 md:w-14",
            iconClassName,
          )}
        >
          {icon}
        </div>
      ) : null}
      <h4
        className={cn(
          "mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base",
          titleClassName,
        )}
      >
        {title}
      </h4>
      {text ? (
        <p
          className={cn(
            "max-w-[240px] text-xs text-gray-400 dark:text-gray-500 md:text-sm",
            textClassName,
          )}
        >
          {text}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
