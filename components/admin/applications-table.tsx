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
import { formatDateTime, formatName, formatPhone, statusLabel } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type {
  ApplicationRow,
  ApplicationStatus,
  PositionRow,
} from "@/lib/supabase/types";

const ALL_VALUE = "__all__";

interface Props {
  applications: ApplicationRow[];
  positions: PositionRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    status: ApplicationStatus | "";
    position: string;
    q: string;
  };
}

export function ApplicationsTable({
  applications,
  positions,
  total,
  page,
  pageSize,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(filters.q);

  // Keep input in sync if URL changes externally
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
    // Reset page when filters change (except when explicitly setting page)
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 md:max-w-md flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Ism, familya yoki pasport bo'yicha qidirish"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Qidirish
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export?format=xlsx"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Eksport (XLSX)
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtr:</span>
        </div>

        <Select
          value={filters.status || ALL_VALUE}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Barcha statuslar</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.position || ALL_VALUE}
          onValueChange={handlePositionChange}
        >
          <SelectTrigger className="w-full md:w-[260px]">
            <SelectValue placeholder="Lavozim" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Barcha lavozimlar</SelectItem>
            {positions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isPending && <Spinner />}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ism Familya</TableHead>
              <TableHead>Lavozim</TableHead>
              <TableHead>Pasport</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Arizalar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{formatName(app)}</TableCell>
                  <TableCell>{app.position_title}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {app.passport_number}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatPhone(app.phone)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(app.created_at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/applications/${app.id}`}>Ko'rish</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jami: <span className="font-medium text-foreground">{total}</span> ariza
            {" "}— sahifa {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || isPending}
            >
              Oldingi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || isPending}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
