import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDownloadUrl } from "@/lib/r2/download";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get("key");
  const filename = req.nextUrl.searchParams.get("filename") ?? undefined;

  if (!key) {
    return NextResponse.json({ error: "Требуется параметр key" }, { status: 400 });
  }

  // Basic safety: only allow R2 keys under our applications/ prefix
  if (!key.startsWith("applications/")) {
    return NextResponse.json(
      { error: "Недопустимый ключ" },
      { status: 403 }
    );
  }

  try {
    const url = await createDownloadUrl(key, filename);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка при скачивании";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
