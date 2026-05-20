"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  label: string;
  objectKey: string | null;
  filename?: string;
}

export function DownloadButton({ label, objectKey, filename }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const disabled = !objectKey;

  async function handleClick() {
    if (!objectKey) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ key: objectKey });
      if (filename) params.set("filename", filename);
      const res = await fetch(`/api/admin/download?${params.toString()}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? "Yuklab olishda xato");
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("Yuklab olish havolasi olinmadi");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast({
        title: "Xato",
        description: err instanceof Error ? err.message : "Noma'lum xato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={disabled || loading}
      className="justify-start"
    >
      {loading ? (
        <Spinner className="mr-2" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {label}
      {disabled && (
        <span className="ml-auto text-xs text-muted-foreground">yo'q</span>
      )}
    </Button>
  );
}
