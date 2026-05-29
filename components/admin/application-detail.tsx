"use client";

import Link from "next/link";
import {
  User,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  Bookmark,
  Users,
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
        <p className="text-xs text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
      </div>
    </div>
  );
}

export function ApplicationDetail({ application }: Props) {
  const isStudent = application.type === "student";

  const cvKey = application.cv_url ? extractKeyFromUrl(application.cv_url) : null;

  const fullName = formatName(application);
  const safeName = fullName.replace(/[^A-Za-z0-9_\- ]/g, "").trim();
  const baseName = safeName || application.passport_number;

  return (
    <div className="space-y-6">
      {/* Sahifa bosh qismi */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
            <Link href="/admin/applications" className="hover:underline">
              Arizalar
            </Link>
            <span>/</span>
            <span>Tafsilotlar</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {fullName}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={application.status} />
            <span className="text-xs text-muted-foreground font-medium">
              Yuborilgan sana: {formatDateTime(application.created_at)}
            </span>
            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${
              isStudent ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              {isStudent ? "O'quvchi" : "Ishchi / Nomzod"}
            </span>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl border-slate-200 font-semibold">
          <Link href="/admin/applications">← Ro'yxatga qaytish</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chap qism: shaxsiy ma'lumotlar */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-lg font-bold text-slate-800">
                {isStudent ? "O'quvchi va Ota-ona Ma'lumotlari" : "Nomzodning Shaxsiy Ma'lumotlari"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldRow
                  icon={User}
                  label="Ismi"
                  value={application.first_name}
                />
                <FieldRow
                  icon={User}
                  label="Familiyasi"
                  value={application.last_name}
                />
                <FieldRow
                  icon={FileText}
                  label={isStudent ? "Hujjat raqami (Guvohnoma/Pasport)" : "Pasport seriyasi va raqami"}
                  value={
                    <span className="font-mono font-bold text-slate-900">{application.passport_number}</span>
                  }
                />
                <FieldRow
                  icon={Phone}
                  label={isStudent ? "Ota-onaning telefon raqami" : "Telefon raqami"}
                  value={
                    <a
                      href={`tel:${application.phone}`}
                      className="text-primary hover:underline font-bold"
                    >
                      {formatPhone(application.phone)}
                    </a>
                  }
                />
                <FieldRow
                  icon={Calendar}
                  label="Tug'ilgan sanasi"
                  value={formatDate(application.birth_date)}
                />
                
                {/* O'quvchi uchun maxsus: Sinf va Ota-onaning ismi */}
                {isStudent ? (
                  <>
                    <FieldRow
                      icon={Bookmark}
                      label="Sinfi"
                      value={<span className="text-orange-600 font-bold">{application.grade}</span>}
                    />
                    <div className="md:col-span-2">
                      <FieldRow
                        icon={Users}
                        label="Ota-onasining to'liq ismi (F.I.SH.)"
                        value={application.parent_name}
                      />
                    </div>
                  </>
                ) : (
                  // Ishchi uchun maxsus: Lavozim
                  <FieldRow
                    icon={Briefcase}
                    label="Kutilayotgan lavozim"
                    value={<span className="text-indigo-900 font-bold">{application.position_title}</span>}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hujjatlar: Faqat vakansiya uchun ko'rsatiladi (CV) */}
          {!isStudent && (
            <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-4">
                <CardTitle className="text-lg font-bold text-slate-800">Yuklangan Hujjatlar</CardTitle>
                <CardDescription className="text-xs">
                  Rezyumeni (CV) yuklab olish uchun quyidagi tugmani bosing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="max-w-xs">
                  <DownloadButton
                    label="Rezyumeni yuklab olish (PDF)"
                    objectKey={cvKey}
                    filename={`${baseName}-CV.pdf`}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* O'ng qism: harakatlar, status o'zgartirish, hr note */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardHeader className="py-4 border-b bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-base font-bold text-slate-850">Ariza holati</CardTitle>
              <CardDescription className="text-xs">Ariza statusini o'zgartirish</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <StatusChanger
                applicationId={application.id}
                currentStatus={application.status}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardHeader className="py-4 border-b bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-base font-bold text-slate-850">Ma'muriyat izohi (HR Note)</CardTitle>
              <CardDescription className="text-xs">Faqat administratorlar uchun ko'rinadi</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <HrNoteEditor
                applicationId={application.id}
                initialNote={application.hr_note}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardHeader className="py-4 border-b bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-base font-bold text-slate-850">Tizim ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs pt-5">
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-400 font-semibold">Yaratilgan sana:</span>
                <span className="font-mono font-bold text-slate-700">
                  {formatDateTime(application.created_at)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-400 font-semibold">Yangilangan sana:</span>
                <span className="font-mono font-bold text-slate-700">
                  {formatDateTime(application.updated_at)}
                </span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <span className="text-slate-400 font-semibold">Ariza ID:</span>
                <span className="font-mono text-[10px] text-slate-500 break-all select-all font-semibold bg-slate-50 px-2 py-1.5 rounded-lg border">
                  {application.id}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
