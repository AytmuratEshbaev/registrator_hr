import { NextResponse } from "next/server";
import { z } from "zod";
import { passportCheckSchema } from "@/lib/validations/passport";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  // Rate limit
  const rl = rateLimit(`check-passport:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Urinishlar soni ko'payib ketdi. Iltimos, bir daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  // JSON tahlil qilish
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "So'rov ma'lumoti noto'g'ri formatda" }, { status: 400 });
  }

  // Zod tekshiruv
  const parsed = passportCheckSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Noto'g'ri ma'lumotlar kiritildi" },
      { status: 400 }
    );
  }

  const { passport_number } = parsed.data;

  // DB tekshiruv
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("applications")
      .select("id, status, hr_note")
      .eq("passport_number", passport_number)
      .maybeSingle();

    if (error) {
      console.error("[check-passport] supabase error:", error);
      return NextResponse.json(
        { error: "Tizim xatoligi. Iltimos, keyinroq qayta urinib ko'ring." },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({
        exists: true,
        status: data.status,
        hr_note: data.hr_note,
      });
    }
    return NextResponse.json({ exists: false });
  } catch (err) {
    console.error("[check-passport] exception:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Noto'g'ri ma'lumotlar" }, { status: 400 });
    }
    return NextResponse.json({ error: "Tizim xatoligi" }, { status: 500 });
  }
}
