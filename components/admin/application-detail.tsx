"use client";

import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { StatusChanger } from "./status-changer";
import { HrNoteEditor } from "./hr-note-editor";
import { DownloadButton } from "./download-button";
import { formatDate, formatDateTime, formatPhone } from "@/lib/utils";
import type { ApplicationRow } from "@/lib/supabase/types";

// Inlined to avoid pulling the AWS SDK into the client bundle.
// Mirrors lib/r2/download.ts → extractKeyFromUrl.
function extractKeyFromUrl(urlOrKey: string): string {
  if (!urlOrKey.startsWith("http")) return urlOrKey;
  try {
    const url = new URL(urlOrKey);
    return url.pathname.replace(/^\//, "");
  } catch {
    return urlOrKey;
  }
}

interface Props {
  application: ApplicationRow;
}

function FieldRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export function ApplicationDetail({ application }: Props) {
  const cvKey = application.cv_url ? extractKeyFromUrl(application.cv_url) : null;
  const passportKey = application.passport_scan_url
    ? extractKeyFromUrl(application.passport_scan_url)
    : null;
  const diplomaKey = application.diploma_url
    ? extractKeyFromUrl(application.diploma_url)
    : null;
  const photoKey = application.photo_url
    ? extractKeyFromUrl(application.photo_url)
    : null;

  const safeName = application.full_name.replace(/[^A-Za-z0-9_\- ]/g, "").trim();
  const baseName = safeName || application.passport_number;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/applications" className="hover:underline">
              Arizalar
            </Link>
            <span>/</span>
            <span>Tafsilotlar</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {application.full_name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={application.status} />
            <span className="text-xs text-muted-foreground">
              Yuborilgan: {formatDateTime(application.created_at)}
            </span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications">← Ro'yxatga qaytish</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: applicant info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldRow
                  icon={User}
                  label="To'liq ism"
                  value={application.full_name}
                />
                <FieldRow
                  icon={FileText}
                  label="Pasport raqami"
                  value={
                    <span className="font-mono">{application.passport_number}</span>
                  }
                />
                <FieldRow
                  icon={Mail}
                  label="Email"
                  value={
                    <a
                      href={`mailto:${application.email}`}
                      className="hover:underline"
                    >
                      {application.email}
                    </a>
                  }
                />
                <FieldRow
                  icon={Phone}
                  label="Telefon"
                  value={
                    <a
                      href={`tel:${application.phone}`}
                      className="hover:underline"
                    >
                      {formatPhone(application.phone)}
                    </a>
                  }
                />
                <FieldRow
                  icon={Calendar}
                  label="Tug'ilgan sana"
                  value={formatDate(application.birth_date)}
                />
                <FieldRow
                  icon={Briefcase}
                  label="Lavozim"
                  value={application.position_title}
                />
              </div>
              {application.about && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">O'zi haqida</p>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {application.about}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hujjatlar</CardTitle>
              <CardDescription>
                Yuklab olish uchun tugmani bosing — havola xavfsiz va vaqtinchalik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <DownloadButton
                  label="CV yuklab olish"
                  objectKey={cvKey}
                  filename={`${baseName}-CV.pdf`}
                />
                <DownloadButton
                  label="Pasport skani"
                  objectKey={passportKey}
                  filename={`${baseName}-pasport`}
                />
                <DownloadButton
                  label="Diplom"
                  objectKey={diplomaKey}
                  filename={`${baseName}-diplom.pdf`}
                />
                <DownloadButton
                  label="3x4 surat"
                  objectKey={photoKey}
                  filename={`${baseName}-surat`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Ariza holatini o'zgartirish</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusChanger
                applicationId={application.id}
                currentStatus={application.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HR izohi</CardTitle>
              <CardDescription>Faqat admin ko'radi</CardDescription>
            </CardHeader>
            <CardContent>
              <HrNoteEditor
                applicationId={application.id}
                initialNote={application.hr_note}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tizim ma'lumoti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yaratilgan:</span>
                <span className="font-mono">
                  {formatDateTime(application.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yangilangan:</span>
                <span className="font-mono">
                  {formatDateTime(application.updated_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono break-all">{application.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
