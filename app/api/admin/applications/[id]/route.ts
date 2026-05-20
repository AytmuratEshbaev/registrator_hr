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

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ application: data });
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

  const { data, error } = await supabase
    .from("applications")
    .update(parsed.data)
    .eq("id", params.id)
    .select()
    .maybeSingle();

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

  // Fetch first so we know which R2 objects to clean up
  const { data: app, error: fetchErr } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!app) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const { error: delErr } = await supabase
    .from("applications")
    .delete()
    .eq("id", params.id);

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  // Best-effort R2 cleanup (don't fail the request if it errors)
  try {
    const a = app as ApplicationRow;
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
