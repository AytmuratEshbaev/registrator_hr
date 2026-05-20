"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/use-toast";
import { PASSPORT_REGEX } from "@/lib/constants";
import { statusFriendlyMessage } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/supabase/types";

interface ExistingApplication {
  status: ApplicationStatus;
  hr_note: string | null;
}

export function PassportCheckForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [passport, setPassport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<ExistingApplication | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExisting(null);

    const normalized = passport.trim().toUpperCase();
    if (!PASSPORT_REGEX.test(normalized)) {
      setError("Pasport raqami noto'g'ri formatda. Misol: AA1234567");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/check-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passport_number: normalized }),
      });

      if (res.status === 429) {
        setError("Juda ko'p urinish. Bir daqiqadan so'ng qayta urinib ko'ring.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
        return;
      }

      const data: {
        exists: boolean;
        status?: ApplicationStatus;
        hr_note?: string | null;
      } = await res.json();

      if (data.exists && data.status) {
        setExisting({ status: data.status, hr_note: data.hr_note ?? null });
        return;
      }

      // Yangi nomzod: saqlash va keyingi qadamga o'tish
      try {
        sessionStorage.setItem("apply.passport", normalized);
      } catch {
        // ignore
      }
      router.push(`/apply/form?passport=${encodeURIComponent(normalized)}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Tarmoq xatosi",
        description: "Server bilan bog'lanib bo'lmadi. Qaytadan urinib ko'ring.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="passport">Pasport raqami</Label>
        <Input
          id="passport"
          name="passport"
          autoComplete="off"
          inputMode="text"
          maxLength={9}
          placeholder="AA1234567"
          value={passport}
          onChange={(e) => setPassport(e.target.value.toUpperCase())}
          disabled={loading}
          required
        />
        <p className="text-xs text-muted-foreground">
          2 ta harf va 7 ta raqamdan iborat. Misol: AA1234567
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2">
          {error}
        </div>
      ) : null}

      {existing ? (
        <div className="rounded-md border bg-card p-4 space-y-3">
          <p className="font-medium">Siz avval ro&apos;yxatdan o&apos;tgansiz</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Arizangiz holati:</span>
            <StatusBadge status={existing.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {statusFriendlyMessage(existing.status)}
          </p>
          {existing.hr_note ? (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground mb-1">HR izohi:</p>
              <p className="whitespace-pre-wrap break-words">{existing.hr_note}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading} size="lg">
        {loading ? (
          <>
            <Spinner className="mr-2" /> Tekshirilmoqda...
          </>
        ) : (
          "Tekshirish"
        )}
      </Button>
    </form>
  );
}
