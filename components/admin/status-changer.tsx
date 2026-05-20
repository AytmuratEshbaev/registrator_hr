"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { statusLabel } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/supabase/types";

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

const VARIANT_MAP: Record<
  ApplicationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  reviewing: "secondary",
  accepted: "default",
  rejected: "destructive",
};

export function StatusChanger({ applicationId, currentStatus }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(
    null
  );

  async function changeStatus(status: ApplicationStatus) {
    if (status === currentStatus) return;
    setPendingStatus(status);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Statusni yangilashda xato");
      }
      toast({
        title: "Status yangilandi",
        description: `Holat: ${statusLabel(status)}`,
      });
      router.refresh();
    } catch (err) {
      toast({
        title: "Xato",
        description: err instanceof Error ? err.message : "Noma'lum xato",
        variant: "destructive",
      });
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {APPLICATION_STATUSES.map((s) => {
        const isCurrent = s === currentStatus;
        const isLoading = pendingStatus === s;
        return (
          <Button
            key={s}
            variant={isCurrent ? VARIANT_MAP[s] : "outline"}
            size="sm"
            disabled={isCurrent || pendingStatus !== null}
            onClick={() => changeStatus(s)}
          >
            {isLoading && <Spinner className="mr-2" />}
            {statusLabel(s)}
          </Button>
        );
      })}
    </div>
  );
}
