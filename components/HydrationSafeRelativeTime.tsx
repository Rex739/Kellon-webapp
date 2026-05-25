"use client";

import { useEffect, useState } from "react";

function formatRelativeDate(value: Date | string, now: number): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMs = now - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HydrationSafeRelativeTime({
  value,
}: {
  value: Date | string;
}) {
  const [now, setNow] = useState<number | null>(null);
  const fallbackDate = new Date(value);
  const fallbackLabel = Number.isNaN(fallbackDate.getTime())
    ? "Just now"
    : fallbackDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

  useEffect(() => {
    setNow(Date.now());
  }, []);

  if (now === null) {
    return <span suppressHydrationWarning>{fallbackLabel}</span>;
  }

  return <span>{formatRelativeDate(value, now)}</span>;
}
