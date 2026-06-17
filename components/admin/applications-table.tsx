"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { CvPreviewModal } from "./cv-preview-modal";
import { formatDateTime, formatName, formatPhone, statusLabel, formatGrade } from "@/lib/utils";
import { useLanguage } from "@/components/language/language-provider";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type {
  ApplicationRow,
  StudentApplicationRow,
  ApplicationStatus,
  PositionRow,
} from "@/lib/supabase/types";

export type AdminApplication = 
  | (ApplicationRow & { type: "vacancy" })
  | (StudentApplicationRow & { type: "student" });

const ALL_VALUE = "__all__";

interface Props {
  applications: AdminApplication[];
  positions: PositionRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    status: ApplicationStatus | "";
    position: string;
    type: string;
    q: string;
  };
  mode: "student" | "vacancy";
}

export function ApplicationsTable({
  applications,
  positions,
  total,
  page,
  pageSize,
  filters,
  mode,
}: Props) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(filters.q);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (!("page" in updates)) params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleStatusChange(value: string) {
    updateParams({ status: value === ALL_VALUE ? null : value });
  }

  function handlePositionChange(value: string) {
    updateParams({ position: value === ALL_VALUE ? null : value });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  }

  function handlePageChange(newPage: number) {
    updateParams({ page: String(newPage) });
  }

  const exportUrl = (() => {
    const params = new URLSearchParams();
    params.set("format", "xlsx");
    if (filters.status) params.set("status", filters.status);
    if (filters.position) params.set("position", filters.position);
    params.set("type", mode);
    if (filters.q) params.set("q", filters.q);
    return `/api/admin/export?${params.toString()}`;
  })();

  return (
    <div className="space-y-4">
      {/* Qidiruv va Eksport */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 md:max-w-md flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("Ism, familiya yoki hujjat raqami...")}
              className="pl-9 rounded-xl border-slate-200"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending} className="rounded-xl">
            {t("Qidirish")}
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <a
            href={exportUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-indigo-950/15"
          >
            <Download className="h-4 w-4" />
            {t("Eksport (XLSX)")}
          </a>
        </div>
      </div>

      {/* Filtrlar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-bold text-slate-800">{t("Filtrlar:")}</span>
        </div>

        {/* Status filtri */}
        <Select
          value={filters.status || ALL_VALUE}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full md:w-[180px] rounded-xl border-slate-200">
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>{t("Barcha statuslar")}</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(statusLabel(s))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Vakansiya filtri - Faqat vakansiyalar uchun */}
        {mode === "vacancy" && (
          <Select
            value={filters.position || ALL_VALUE}
            onValueChange={handlePositionChange}
          >
            <SelectTrigger className="w-full md:w-[220px] rounded-xl border-slate-200">
              <SelectValue placeholder={t("Vakansiya lavozimi")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("Barcha vakansiyalar")}</SelectItem>
              {positions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isPending && <Spinner />}
      </div>

      {/* Arizalar jadvali */}
      <div className="rounded-2xl border border-slate-200/80 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b">
            <TableRow>
              <TableHead className="font-bold text-slate-800">{t("F.I.SH.")}</TableHead>
              <TableHead className="font-bold text-slate-800">{mode === "student" ? t("Sinf") : t("Lavozim")}</TableHead>
              <TableHead className="font-bold text-slate-800">{t("Hujjat raqami")}</TableHead>
              <TableHead className="font-bold text-slate-800">{t("Telefon raqami")}</TableHead>
              <TableHead className="font-bold text-slate-800">{t("Sana")}</TableHead>
              <TableHead className="font-bold text-slate-800">{t("Status")}</TableHead>
              <TableHead className="text-right font-bold text-slate-800">{t("Amallar")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                  {t("Arizalar topilmadi")}
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => {
                const isAppStudent = app.type === "student";
                return (
                  <TableRow key={app.id} className="hover:bg-slate-50/50">
                    {/* F.I.SH */}
                    <TableCell className="font-bold text-slate-900">{formatName(app)}</TableCell>

                    {/* Sinf / Lavozim */}
                    <TableCell className="font-medium text-slate-700">
                      {isAppStudent ? (
                        <span className="text-orange-600 font-semibold">{formatGrade(app.grade, language)}</span>
                      ) : (
                        <span className="text-indigo-900 font-semibold">{app.position_title}</span>
                      )}
                    </TableCell>

                    {/* Hujjat raqami */}
                    <TableCell className="font-mono text-xs text-slate-600 font-semibold">
                      {app.passport_number}
                    </TableCell>

                    {/* Telefon raqami */}
                    <TableCell className="text-xs whitespace-nowrap text-slate-600 font-medium">
                      {formatPhone(app.phone)}
                    </TableCell>

                    {/* Sana */}
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDateTime(app.created_at)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>

                    {/* Amallar */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold border-slate-200">
                          <Link href={mode === "student" ? `/admin/students/${app.id}` : `/admin/candidates/${app.id}`}>{t("Ko'rish")}</Link>
                        </Button>
                        {!isAppStudent && (
                          <CvPreviewModal
                            applicationId={app.id}
                            hasFile={Boolean(app.cv_url)}
                            name={formatName(app)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {t("Jami")}: <span className="font-bold text-slate-800">{total}</span> {t("ta ariza")}
            {" "}— {t("sahifa")} {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || isPending}
              className="rounded-lg font-medium border-slate-200"
            >
              {t("Orqaga")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || isPending}
              className="rounded-lg font-medium border-slate-200"
            >
              {t("Oldinga")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
