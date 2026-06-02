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

interface PassportCheckFormProps {
  type: "student" | "vacancy";
}

export function PassportCheckForm({ type }: PassportCheckFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [passport, setPassport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<ExistingApplication | null>(null);

  const isStudent = type === "student";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExisting(null);

    const normalized = passport.trim().toUpperCase();
    if (!PASSPORT_REGEX.test(normalized)) {
      setError(
        isStudent
          ? "Hujjat raqami formati noto'g'ri. (Masalan: AA1234567 yoki I-AN 1234567)"
          : "Pasport raqami formati noto'g'ri. (Masalan: AA1234567)"
      );
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
        setError("Urinishlar soni juda ko'payib ketdi. Iltimos, keyinroq urinib ko'ring.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
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

      // Yangi ariza: keyingi qadamga o'tish
      try {
        sessionStorage.setItem("apply.passport", normalized);
        sessionStorage.setItem("apply.type", type);
      } catch {
        // ignore
      }
      router.push(`/?passport=${encodeURIComponent(normalized)}&type=${type}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Aloqa xatoligi",
        description: "Server bilan bog'lanib bo'lmadi. Internet aloqangizni tekshirib, qayta urinib ko'ring.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="passport">
          {isStudent ? "Tug'ilganlik guvohnomasi yoki Pasport raqami" : "Pasport seriyasi va raqami"}
        </Label>
        <Input
          id="passport"
          name="passport"
          autoComplete="off"
          inputMode="text"
          maxLength={20}
          placeholder={isStudent ? "I-TAS 1234567 yoki AA1234567" : "AA1234567"}
          value={passport}
          onChange={(e) => setPassport(e.target.value.toUpperCase())}
          disabled={loading}
          required
          className="rounded-xl border-slate-200 focus-visible:ring-indigo-900"
        />
        <p className="text-xs text-slate-400">
          {isStudent
            ? "O'quvchining guvohnomasi yoki pasport raqami. Masalan: I-TAS 1234567 yoki AA1234567"
            : "Pasport seriyasi va raqami. Masalan: AA1234567"}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm px-4 py-3 leading-relaxed">
          {error}
        </div>
      ) : null}

      {existing ? (
        <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
          <p className="font-bold text-slate-800">
            {isStudent
              ? "Ushbu o'quvchi bo'yicha ariza allaqachon topshirilgan"
              : "Siz allaqachon ariza topshirgansiz"}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Ariza holati:</span>
            <StatusBadge status={existing.status} />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {statusFriendlyMessage(existing.status)}
          </p>
          {existing.hr_note ? (
            <div className="rounded-xl bg-white border px-4 py-3 text-sm shadow-sm">
              <p className="text-xs text-slate-400 mb-1 font-semibold">Ma'muriyat izohi:</p>
              <p className="whitespace-pre-wrap break-words text-slate-700 font-medium">{existing.hr_note}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        className={`w-full rounded-xl py-6 font-semibold shadow-lg text-white transition-all ${
          isStudent
            ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
            : "bg-indigo-900 hover:bg-indigo-950 shadow-indigo-950/20"
        }`}
        disabled={loading}
        size="lg"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" /> Tekshirilmoqda...
          </>
        ) : (
          "Tekshirish va davom etish"
        )}
      </Button>
    </form>
  );
}
