"use client";

import Link from "next/link";
import {
  User,
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
import { StatusChanger } from "./status-changer";
import { HrNoteEditor } from "./hr-note-editor";
import { DownloadButton } from "./download-button";
import { formatDate, formatDateTime, formatName, formatPhone } from "@/lib/utils";
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

  const fullName = formatName(application);
  const safeName = fullName.replace(/[^A-Za-z0-9_\- ]/g, "").trim();
  const baseName = safeName || application.passport_number;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/applications" className="hover:underline">
              Заявки
            </Link>
            <span>/</span>
            <span>Подробности</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {fullName}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={application.status} />
            <span className="text-xs text-muted-foreground">
              Подано: {formatDateTime(application.created_at)}
            </span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications">← Вернуться к списку</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: applicant info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldRow
                  icon={User}
                  label="Имя"
                  value={application.first_name}
                />
                <FieldRow
                  icon={User}
                  label="Фамилия"
                  value={application.last_name}
                />
                <FieldRow
                  icon={FileText}
                  label="Номер паспорта"
                  value={
                    <span className="font-mono">{application.passport_number}</span>
                  }
                />
                <FieldRow
                  icon={Phone}
                  label="Телефон"
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
                  label="Дата рождения"
                  value={formatDate(application.birth_date)}
                />
                <FieldRow
                  icon={Briefcase}
                  label="Должность"
                  value={application.position_title}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Документы</CardTitle>
              <CardDescription>
                Нажмите кнопку, чтобы скачать — ссылка безопасная и временная
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <DownloadButton
                  label="Скачать резюме"
                  objectKey={cvKey}
                  filename={`${baseName}-CV.pdf`}
                />
                <DownloadButton
                  label="Скан паспорта"
                  objectKey={passportKey}
                  filename={`${baseName}-pasport`}
                />
                <DownloadButton
                  label="Диплом"
                  objectKey={diplomaKey}
                  filename={`${baseName}-diplom.pdf`}
                />
                <DownloadButton
                  label="Фото 3x4"
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
              <CardTitle>Статус</CardTitle>
              <CardDescription>Изменить статус заявки</CardDescription>
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
              <CardTitle>Комментарий HR</CardTitle>
              <CardDescription>Видит только администратор</CardDescription>
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
              <CardTitle>Системная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Создано:</span>
                <span className="font-mono">
                  {formatDateTime(application.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Обновлено:</span>
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
