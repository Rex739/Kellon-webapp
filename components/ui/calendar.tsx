"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-black dark:text-white",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-[0.75rem] font-medium text-gray-500 dark:text-gray-400",
        week: "mt-2 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 text-sm font-normal aria-selected:opacity-100",
        ),
        selected:
          "rounded-full bg-primary-60 text-white hover:bg-primary-60 hover:text-white focus:bg-primary-60 focus:text-white",
        today: "font-semibold text-primary-60 dark:text-primary-80",
        outside:
          "text-gray-400 opacity-50 dark:text-gray-500 aria-selected:opacity-30",
        disabled: "text-gray-400 opacity-50 dark:text-gray-500",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;

          return (
            <Icon
              className={cn("h-4 w-4", className)}
              aria-hidden="true"
              {...chevronProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
