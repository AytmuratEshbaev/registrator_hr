import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, statusLabel } from "@/lib/utils";
import type { AdminApplication } from "@/components/admin/applications-table";
import type { ApplicationStatus } from "@/lib/supabase/types";

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
      { error: "Faqat xlsx yoki csv formatlari qabul qilinadi" },
      { status: 400 }
    );
  }

  // Get active filters from search params
  const status = (req.nextUrl.searchParams.get("status") ?? "") as ApplicationStatus | "";
  const position = req.nextUrl.searchParams.get("position") ?? "";
  const type = req.nextUrl.searchParams.get("type") ?? "";
  const q = req.nextUrl.searchParams.get("q") ?? "";

  let combined: AdminApplication[] = [];

  if (type === "student") {
    let query = supabase.from("student_applications").select("*");
    if (status) query = query.eq("status", status);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    combined = (data ?? []).map((x) => ({ ...x, type: "student" as const }));
  } else if (type === "vacancy") {
    let query = supabase.from("applications").select("*");
    if (status) query = query.eq("status", status);
    if (position) query = query.eq("position_id", position);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    combined = (data ?? []).map((x) => ({ ...x, type: "vacancy" as const }));
  } else {
    // Fetch both and merge
    let studentQuery = supabase.from("student_applications").select("*");
    if (status) studentQuery = studentQuery.eq("status", status);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      studentQuery = studentQuery.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }

    let vacancyQuery = supabase.from("applications").select("*");
    if (status) vacancyQuery = vacancyQuery.eq("status", status);
    if (position) vacancyQuery = vacancyQuery.eq("position_id", position);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      vacancyQuery = vacancyQuery.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }

    const [studentsRes, vacanciesRes] = await Promise.all([studentQuery, vacancyQuery]);
    
    if (studentsRes.error) return NextResponse.json({ error: studentsRes.error.message }, { status: 500 });
    if (vacanciesRes.error) return NextResponse.json({ error: vacanciesRes.error.message }, { status: 500 });

    const students = (studentsRes.data ?? []).map((x) => ({ ...x, type: "student" as const }));
    const vacancies = (vacanciesRes.data ?? []).map((x) => ({ ...x, type: "vacancy" as const }));

    combined = [...students, ...vacancies].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const rows = combined.map((a) => ({
    "Ismi": a.first_name,
    "Familiyasi": a.last_name,
    "Sharifi": a.middle_name ?? "",
    "Ariza turi": a.type === "student" ? "O'quvchi" : "Vakansiya",
    "Hujjat raqami": a.passport_number,
    "Asosiy telefon": a.phone,
    "Qo'shimcha telefon": a.phone_secondary ?? "",
    "Sinf / Lavozim": a.type === "student" ? a.grade : a.position_title,
    "Maktabdan oldingi tayyorgarlik":
      a.type === "student" && a.grade === "1"
        ? a.preschool_prep === "yes"
          ? "Ha"
          : "Yo'q"
        : "",
    "Ota-onasining ismi": a.type === "student" ? a.middle_name : "",
    "Status": statusLabel(a.status),
    "Ma'muriyat izohi (HR)": a.hr_note ?? "",
    "Topshirilgan sana": formatDateTime(a.created_at),
    "Yangilangan sana": formatDateTime(a.updated_at),
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
        "Content-Disposition": `attachment; filename="arizalar-${stamp}.csv"`,
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
  XLSX.utils.book_append_sheet(wb, ws, "Arizalar");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buf);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="arizalar-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
