import { cn } from "@/lib/utils";
import { statusColor, statusLabel } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/supabase/types";

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusColor(status),
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
