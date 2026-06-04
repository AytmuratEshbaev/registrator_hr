"use client";

import { cn } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/supabase/types";
import { useLanguage } from "@/components/language/language-provider";

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusColor(status),
        className
      )}
    >
      {t(statusLabel(status))}
    </span>
  );
}
