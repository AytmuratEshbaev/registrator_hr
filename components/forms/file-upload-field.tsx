"use client";

import { useRef, useState } from "react";
import { Upload, Check, X, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { FILE_LIMITS, type FileKind } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";

interface FileUploadFieldProps {
  kind: FileKind;
  passport_number: string;
  label: string;
  onUploaded: (key: string | null) => void;
  required?: boolean;
}

type UploadStatus = "idle" | "compressing" | "requesting" | "uploading" | "done" | "error";

export function FileUploadField({
  kind,
  passport_number,
  label,
  onUploaded,
  required = true,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limits = FILE_LIMITS[kind];
  const accept = limits.mimes.join(",");

  function reset() {
    setStatus("idle");
    setProgress(0);
    setFilename(null);
    setSize(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onUploaded(null);
  }

  async function handleFile(file: File) {
    setError(null);

    let fileToUpload: File = file;

    // Surat siqish (photo uchun)
    if (kind === "photo" && file.type.startsWith("image/")) {
      try {
        setStatus("compressing");
        const { default: imageCompression } = await import("browser-image-compression");
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
        fileToUpload = new File([compressed], file.name, { type: compressed.type || file.type });
      } catch (err) {
        console.error("[upload] compression failed:", err);
        // siqish muvaffaqiyatsiz bo'lsa, asl faylni davom ettiramiz
      }
    }

    // Tekshirish
    if (!(limits.mimes as readonly string[]).includes(fileToUpload.type)) {
      setError(`Faqat ${limits.mimes.join(", ")} formatlari ruxsat etilgan.`);
      setStatus("error");
      return;
    }
    if (fileToUpload.size > limits.maxBytes) {
      const mb = Math.round(limits.maxBytes / 1024 / 1024);
      const kb = Math.round(limits.maxBytes / 1024);
      setError(
        `Fayl hajmi ${limits.maxBytes >= 1024 * 1024 ? mb + "MB" : kb + "KB"} dan oshmasligi kerak.`
      );
      setStatus("error");
      return;
    }

    setFilename(fileToUpload.name);
    setSize(fileToUpload.size);

    try {
      // 1) Presigned URL olish
      setStatus("requesting");
      const presignRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passport_number,
          kind,
          contentType: fileToUpload.type,
          contentLength: fileToUpload.size,
          filename: fileToUpload.name,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data?.error ?? "Yuklash uchun ruxsat olinmadi.");
      }
      const { uploadUrl, key } = (await presignRes.json()) as {
        uploadUrl: string;
        key: string;
      };

      // 2) Faylni R2'ga yuklash (progress bilan)
      setStatus("uploading");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", fileToUpload.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Yuklash xatosi: HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Tarmoq xatosi yuz berdi."));
        xhr.send(fileToUpload);
      });

      setStatus("done");
      setProgress(100);
      onUploaded(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Xatolik yuz berdi.";
      setError(message);
      setStatus("error");
      onUploaded(null);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFile(file);
  }

  const isBusy =
    status === "compressing" || status === "requesting" || status === "uploading";

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>

      {status === "idle" || status === "error" ? (
        <label
          htmlFor={`file-${kind}`}
          className={cn(
            "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md px-4 py-6 cursor-pointer transition-colors",
            "hover:border-primary/50 hover:bg-primary/5",
            status === "error" ? "border-destructive/40 bg-destructive/5" : "border-input"
          )}
        >
          <Upload className="w-5 h-5 text-muted-foreground" />
          <div className="text-sm text-center">
            <span className="font-medium">Faylni tanlang</span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {limits.label} &middot; maks.{" "}
            {limits.maxBytes >= 1024 * 1024
              ? `${Math.round(limits.maxBytes / 1024 / 1024)}MB`
              : `${Math.round(limits.maxBytes / 1024)}KB`}
          </div>
          <input
            ref={inputRef}
            id={`file-${kind}`}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={onChange}
            disabled={isBusy}
          />
        </label>
      ) : (
        <div
          className={cn(
            "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
            status === "done" && "border-green-300 bg-green-50",
            isBusy && "border-blue-300 bg-blue-50"
          )}
        >
          {status === "done" ? (
            <Check className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <Spinner className="text-blue-600 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate font-medium">{filename}</span>
              {size != null ? (
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatFileSize(size)}
                </span>
              ) : null}
            </div>
            {isBusy ? (
              <div className="mt-1">
                <div className="h-1.5 bg-blue-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${status === "uploading" ? progress : 5}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {status === "compressing" && "Siqilmoqda..."}
                  {status === "requesting" && "Ruxsat olinmoqda..."}
                  {status === "uploading" && `Yuklanmoqda ${progress}%`}
                </div>
              </div>
            ) : null}
            {status === "done" ? (
              <div className="text-xs text-green-700 mt-0.5">Yuklandi</div>
            ) : null}
          </div>
          {!isBusy ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              aria-label="Faylni o'chirish"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
