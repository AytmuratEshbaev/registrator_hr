import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, statusLabel } from "@/lib/utils";
import type { ApplicationRow } from "@/lib/supabase/types";

function todayStamp(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = (req.nextUrl.searchParams.get("format") ?? "xlsx").toLowerCase();
  if (format !== "xlsx" && format !== "csv") {
    return NextResponse.json(
      { error: "Допустимы только форматы xlsx или csv" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = ((data as ApplicationRow[] | null) ?? []).map((a) => ({
    "Имя": a.first_name,
    "Фамилия": a.last_name,
    "Паспорт": a.passport_number,
    "Телефон": a.phone,
    "Дата рождения": formatDate(a.birth_date),
    "Должность": a.position_title,
    "Статус": statusLabel(a.status),
    "Комментарий HR": a.hr_note ?? "",
    "Подано": formatDateTime(a.created_at),
    "Обновлено": formatDateTime(a.updated_at),
  }));

  const stamp = todayStamp();

  if (format === "csv") {
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    // Prepend BOM so Excel opens UTF-8 correctly
    const buf = Buffer.from("﻿" + csv, "utf-8");
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zayavki-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // xlsx
  const ws = XLSX.utils.json_to_sheet(rows);
  // Roughly autofit column widths
  const headerKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
  ws["!cols"] = headerKeys.map((key) => {
    const maxLen = rows.reduce((acc, row) => {
      const val = (row as Record<string, string>)[key] ?? "";
      return Math.max(acc, String(val).length);
    }, key.length);
    return { wch: Math.min(50, Math.max(10, maxLen + 2)) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заявки");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buf);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="zayavki-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
