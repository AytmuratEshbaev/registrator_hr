import { NextResponse } from "next/server";
import { z } from "zod";
import { passportCheckSchema } from "@/lib/validations/passport";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  // Rate limit
  const rl = rateLimit(`check-passport:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Bir daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  // JSON tahlil qilish
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yaroqsiz so'rov tanasi" }, { status: 400 });
  }

  // Zod tekshiruv
  const parsed = passportCheckSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Noto'g'ri ma'lumot" },
      { status: 400 }
    );
  }

  const { passport_number, turnstileToken } = parsed.data;

  // Turnstile (token mavjud bo'lsa tekshirish; bo'lmasa - 400)
  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Bot tekshiruvidan o'tish talab qilinadi." },
      { status: 400 }
    );
  }
  const ok = await verifyTurnstile(turnstileToken, ip);
  if (!ok) {
    return NextResponse.json(
      { error: "Bot tekshiruvi muvaffaqiyatsiz tugadi. Qaytadan urinib ko'ring." },
      { status: 400 }
    );
  }

  // DB tekshiruv
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("passport_number", passport_number)
      .maybeSingle();

    if (error) {
      console.error("[check-passport] supabase error:", error);
      return NextResponse.json(
        { error: "Server xatosi. Keyinroq urinib ko'ring." },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: !!data });
  } catch (err) {
    console.error("[check-passport] exception:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
