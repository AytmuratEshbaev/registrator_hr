"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language/language-provider";

interface Props {
  applicationId: string;
  initialNote: string | null;
}

export function HrNoteEditor({ applicationId, initialNote }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);

  const initial = initialNote ?? "";
  const dirty = note.trim() !== initial.trim();

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hr_note: note.trim() || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Saqlashda xatolik");
      }
      toast({ title: t("Saqlandi"), description: t("HR izohi yangilandi") });
      router.refresh();
    } catch (err) {
      toast({
        title: t("Xatolik"),
        description: err instanceof Error ? t(err.message) : t("Noma'lum xatolik"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("HR izohini bu yerga yozing...")}
        rows={5}
      />
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving || !dirty}>
          {saving && <Spinner className="mr-2" />}
          {t("Saqlash")}
        </Button>
      </div>
    </div>
  );
}
