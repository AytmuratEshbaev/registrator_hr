"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language/language-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatName, formatGrade } from "@/lib/utils";
import type { AdminApplication } from "@/components/admin/applications-table";
import { GraduationCap, Briefcase, FileText, CheckCircle } from "lucide-react";

interface DashboardContentProps {
  total: number;
  studentCount: number;
  vacancyCount: number;
  statusCounts: {
    pending: number;
    reviewing: number;
    accepted: number;
    rejected: number;
  };
  latest: AdminApplication[];
  gradeEntries: [string, number][];
  positionEntries: [string, number][];
}

export function DashboardContent({
  total,
  studentCount,
  vacancyCount,
  statusCounts,
  latest,
  gradeEntries,
  positionEntries,
}: DashboardContentProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Sahifa sarlavhasi */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("Boshqaruv paneli")}</h1>
        <p className="text-muted-foreground">{t("Zeyin School arizalar statistikasi va oxirgi arizalar")}</p>
      </div>

      {/* Statistika kartalari (Yuqori qism) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Jami arizalar */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">{t("Jami arizalar")}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("Platformadagi barcha arizalar")}</p>
          </CardContent>
        </Card>

        {/* O'quvchi arizalari */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">{t("O'quvchi qabuli")}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-orange-600">{studentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("Maktabga topshirgan o'quvchilar")}
            </p>
          </CardContent>
        </Card>

        {/* Vakansiya arizalari */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">{t("Nomzodlar (Vakansiya)")}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-900">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-900">{vacancyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("Ishga topshirgan mutaxassislar")}
            </p>
          </CardContent>
        </Card>

        {/* Ko'rib chiqilishi kutilayotganlar */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">{t("Yangi arizalar")}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-500">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("Ko'rib chiqilishi kutilmoqda")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Arizalar ro'yxati va taqsimot */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chap panel: Oxirgi arizalar */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b py-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">{t("Oxirgi topshirilgan arizalar")}</CardTitle>
              <CardDescription className="text-xs">{t("Oxirgi topshirilgan 5 ta ariza ro'yxati")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold border-slate-200">
                <Link href="/admin/students">{t("O'quvchilar")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold border-slate-200">
                <Link href="/admin/candidates">{t("Nomzodlar")}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {latest.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">
                {t("Hozircha arizalar topshirilmagan")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-slate-800">{t("F.I.SH.")}</TableHead>
                    <TableHead className="font-bold text-slate-800">{t("Turi")}</TableHead>
                    <TableHead className="font-bold text-slate-800">{t("Sinf / Lavozim")}</TableHead>
                    <TableHead className="font-bold text-slate-800">{t("Sana")}</TableHead>
                    <TableHead className="font-bold text-slate-800">{t("Status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.map((app) => {
                    const isAppStudent = app.type === "student";
                    return (
                      <TableRow key={app.id} className="hover:bg-slate-50/30">
                        <TableCell className="font-bold text-slate-900">
                          <Link
                            href={isAppStudent ? `/admin/students/${app.id}` : `/admin/candidates/${app.id}`}
                            className="hover:underline"
                          >
                            {formatName(app)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            isAppStudent 
                              ? "bg-orange-50 text-orange-700 border border-orange-100" 
                              : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}>
                            {isAppStudent ? t("O'quvchi") : t("Vakansiya")}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {isAppStudent ? formatGrade(app.grade, language) : t(app.position_title || "")}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                          {formatDateTime(app.created_at)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* O'ng panel: Taqsimot */}
        <div className="space-y-6">
          {/* O'quvchilar sinflar kesimida */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-base font-bold text-slate-800">{t("O'quvchilar sinflar kesimida")}</CardTitle>
              <CardDescription className="text-xs">{t("Sinflarga taqsimlanishi")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
              {gradeEntries.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center font-medium">
                  {t("Ma'lumot mavjud emas")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {gradeEntries.map(([grade, count]) => {
                    const pct = studentCount > 0 ? Math.round((count / studentCount) * 100) : 0;
                    return (
                      <li key={grade} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate pr-2">{formatGrade(grade, language)}</span>
                          <span className="text-slate-500 shrink-0">
                            {count} {t("ta ariza")} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden border">
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Ishchilar lavozimlar kesimida */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-base font-bold text-slate-800">{t("Ishchilar lavozimlar kesimida")}</CardTitle>
              <CardDescription className="text-xs">{t("Lavozimlarga taqsimlanishi")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
              {positionEntries.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center font-medium">
                  {t("Ma'lumot mavjud emas")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {positionEntries.map(([title, count]) => {
                    const pct = vacancyCount > 0 ? Math.round((count / vacancyCount) * 100) : 0;
                    return (
                      <li key={title} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate pr-2">{t(title)}</span>
                          <span className="text-slate-500 shrink-0">
                            {count} {t("ta ariza")} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden border">
                          <div
                            className="h-full bg-indigo-900"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
