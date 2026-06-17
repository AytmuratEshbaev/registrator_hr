"use client";

import { useState } from "react";
import { Eye, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/language/language-provider";

interface Props {
  applicationId: string;
  hasFile: boolean;
  /** Modal sarlavhasida ko'rsatiladigan nomzod ismi. */
  name?: string;
}

export function CvPreviewModal({ applicationId, hasFile, name }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function handleOpen() {
    if (!hasFile) return;
    setOpen(true);
    if (url) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        id: applicationId,
        field: "cv_url",
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
    } catch (err) {
      setOpen(false);
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
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleOpen}
        disabled={!hasFile}
        title={hasFile ? t("Rezyumeni ko'rish") : t("Rezyume yuklanmagan")}
        className="rounded-lg border-slate-200 text-slate-600 hover:text-primary disabled:opacity-40"
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">{t("Rezyumeni ko'rish")}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col gap-3 p-4 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base font-bold">
              {t("Rezyume (CV)")}
              {name ? ` — ${name}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {loading || !url ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <Spinner className="mr-2" />
                {t("Yuklanmoqda...")}
              </div>
            ) : (
              <iframe src={url} title={t("Rezyume preview")} className="h-full w-full" />
            )}
          </div>

          {url && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("Yangi oynada ochish")}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-lg">
                <a href={url} download>
                  <Download className="mr-2 h-4 w-4" />
                  {t("Yuklab olish")}
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
