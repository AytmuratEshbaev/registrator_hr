"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  applicationId: string;
  initialNote: string | null;
}

export function HrNoteEditor({ applicationId, initialNote }: Props) {
  const router = useRouter();
  const { toast } = useToast();
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
        throw new Error(body.error ?? "Ошибка при сохранении");
      }
      toast({ title: "Сохранено", description: "Комментарий HR обновлён" });
      router.refresh();
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Неизвестная ошибка",
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
        placeholder="Напишите комментарий HR здесь..."
        rows={5}
      />
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving || !dirty}>
          {saving && <Spinner className="mr-2" />}
          Сохранить
        </Button>
      </div>
    </div>
  );
}
