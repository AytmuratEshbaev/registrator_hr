"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { PASSPORT_REGEX } from "@/lib/constants";

export function PassportCheckForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [passport, setPassport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existsMessage, setExistsMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExistsMessage(null);

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

      const data: { exists: boolean } = await res.json();
      if (data.exists) {
        setExistsMessage(
          "Ushbu pasport raqami bilan ariza allaqachon topshirilgan. Iltimos, HR bo'limi javobini kuting."
        );
        return;
      }

      // Saqlash va keyingi qadamga o'tish
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

      {existsMessage ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-sm px-3 py-2">
          {existsMessage}
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
