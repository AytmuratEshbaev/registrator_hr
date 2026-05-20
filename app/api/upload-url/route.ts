import { NextResponse } from "next/server";
import { uploadUrlSchema } from "@/lib/validations/upload";
import { buildObjectKey, createUploadUrl } from "@/lib/r2/upload";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { FileKind } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  // Rate limit (har bir hujjat alohida URL talab qilinadi, shuning uchun cheklov keng)
  const rl = rateLimit(`upload-url:${ip}`, { max: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const parsed = uploadUrlSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { passport_number, kind, contentType, contentLength } = parsed.data;

  try {
    const key = buildObjectKey(passport_number, kind as FileKind, contentType);
    const uploadUrl = await createUploadUrl({ key, contentType, contentLength });
    return NextResponse.json({ uploadUrl, key });
  } catch (err) {
    console.error("[upload-url] error:", err);
    return NextResponse.json(
      { error: "Не удалось создать URL для загрузки." },
      { status: 500 }
    );
  }
}
