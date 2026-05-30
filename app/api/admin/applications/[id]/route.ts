import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getR2Client, R2_BUCKET } from "@/lib/r2/client";
import { extractKeyFromUrl } from "@/lib/r2/download";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type { ApplicationRow } from "@/lib/supabase/types";

const patchSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  hr_note: z.string().max(5000).nullable().optional(),
});

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return supabase;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. O'quvchi arizasini tekshirish
  const { data: studentData, error: studentError } = await supabase
    .from("student_applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (studentData) {
    return NextResponse.json({ application: { ...studentData, type: "student" } });
  }

  // 2. Vakansiya arizasini tekshirish
  const { data: vacancyData, error: vacancyError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (vacancyData) {
    return NextResponse.json({ application: { ...vacancyData, type: "vacancy" } });
  }

  if (studentError) {
    return NextResponse.json({ error: studentError.message }, { status: 500 });
  }
  if (vacancyError) {
    return NextResponse.json({ error: vacancyError.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Не найдено" }, { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "Нет полей для обновления" },
      { status: 400 }
    );
  }

  // 1. O'quvchi arizalarida borligini tekshirish
  const { data: studentCheck } = await supabase
    .from("student_applications")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();

  let data;
  let error;

  if (studentCheck) {
    const res = await supabase
      .from("student_applications")
      .update(parsed.data)
      .eq("id", params.id)
      .select()
      .maybeSingle();
    data = res.data ? { ...res.data, type: "student" } : null;
    error = res.error;
  } else {
    const res = await supabase
      .from("applications")
      .update(parsed.data)
      .eq("id", params.id)
      .select()
      .maybeSingle();
    data = res.data ? { ...res.data, type: "vacancy" } : null;
    error = res.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ application: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. O'quvchi arizasini tekshirish va o'chirish
  const { data: studentApp, error: studentFetchErr } = await supabase
    .from("student_applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (studentApp) {
    const { error: delErr } = await supabase
      .from("student_applications")
      .delete()
      .eq("id", params.id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // 2. Vakansiya arizasini tekshirish va o'chirish
  const { data: vacancyApp, error: vacancyFetchErr } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (vacancyApp) {
    const { error: delErr } = await supabase
      .from("applications")
      .delete()
      .eq("id", params.id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // R2 dagi yuklangan fayllarni tozalash (Best-effort)
    try {
      const a = vacancyApp as ApplicationRow;
      const urls = [a.cv_url, a.passport_scan_url, a.diploma_url, a.photo_url];
      const client = getR2Client();
      await Promise.allSettled(
        urls
          .filter((u): u is string => Boolean(u))
          .map((u) => extractKeyFromUrl(u))
          .map((key) =>
            client.send(
              new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })
            )
          )
      );
    } catch {
      // ignore — DB deletion already succeeded
    }

    return NextResponse.json({ ok: true });
  }

  if (studentFetchErr) {
    return NextResponse.json({ error: studentFetchErr.message }, { status: 500 });
  }
  if (vacancyFetchErr) {
    return NextResponse.json({ error: vacancyFetchErr.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Не найдено" }, { status: 404 });
}
