"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language/language-provider";

interface Props {
  applicationId: string;
  field: "cv_url" | "passport_scan_url" | "diploma_url" | "photo_url";
  hasFile: boolean;
}

export function CvPreview({ applicationId, field, hasFile }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function loadUrl(): Promise<string | null> {
    if (url) return url;
    const params = new URLSearchParams({
      id: applicationId,
      field,
      disposition: "inline",
    });
    const res = await fetch(`/api/admin/download?${params.toString()}`);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error ?? "Yuklab olishda xatolik");
    }
    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error("Yuklab olishda xatolik");
    setUrl(data.url);
    return data.url;
  }

  async function handleToggle() {
    if (!hasFile) return;
    if (open) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      await loadUrl();
      setOpen(true);
    } catch (err) {
      toast({
        title: t("Xatolik"),
        description: err instanceof Error ? t(err.message) : t("Noma'lum xatolik"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={handleToggle}
          disabled={!hasFile || loading}
          className="justify-start"
        >
          {loading ? (
            <Spinner className="mr-2" />
          ) : open ? (
            <EyeOff className="mr-2 h-4 w-4" />
          ) : (
            <Eye className="mr-2 h-4 w-4" />
          )}
          {open ? t("Ko'rishni yopish") : t("Rezyumeni ko'rish (Preview)")}
          {!hasFile && (
            <span className="ml-auto text-xs text-muted-foreground">{t("Yo'q")}</span>
          )}
        </Button>
        {open && url && (
          <Button asChild variant="ghost" className="text-primary">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("Yangi oynada ochish")}
            </a>
          </Button>
        )}
      </div>

      {open && url && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <iframe
            src={url}
            title={t("Rezyume preview")}
            className="h-[70vh] w-full"
          />
        </div>
      )}
    </div>
  );
}
