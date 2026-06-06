import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDownloadUrl, extractKeyFromUrl } from "@/lib/r2/download";

// Faqat vakansiya arizalarida fayl maydonlari mavjud.
const ALLOWED_FIELDS = [
  "cv_url",
  "passport_scan_url",
  "diploma_url",
  "photo_url",
] as const;
type DownloadField = (typeof ALLOWED_FIELDS)[number];

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  const field = req.nextUrl.searchParams.get("field") as DownloadField | null;
  const filename = req.nextUrl.searchParams.get("filename") ?? undefined;

  if (!id || !field || !ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  // Kalitni mijoz EMAS, balki bazadagi haqiqiy yozuvdan olamiz (IDOR oldini olish).
  const { data: row, error } = await supabase
    .from("applications")
    .select(`id, ${field}`)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[download] lookup error:", error);
    return NextResponse.json({ error: "Tizim xatoligi" }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Ariza topilmadi" }, { status: 404 });
  }

  const stored = (row as Record<string, unknown>)[field];
  if (!stored || typeof stored !== "string") {
    return NextResponse.json({ error: "Fayl mavjud emas" }, { status: 404 });
  }

  const key = extractKeyFromUrl(stored);
  if (!key.startsWith("applications/")) {
    return NextResponse.json({ error: "Noto'g'ri fayl kaliti" }, { status: 400 });
  }

  try {
    const url = await createDownloadUrl(key, filename);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[download] presign error:", err);
    return NextResponse.json({ error: "Yuklab olishda xatolik" }, { status: 500 });
  }
}
