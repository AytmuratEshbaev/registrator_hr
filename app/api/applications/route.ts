import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validations/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  // Rate limit
  const rl = rateLimit(`applications:${ip}`, { max: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Bir daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yaroqsiz so'rov tanasi" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first?.path?.join(".") ?? "";
    return NextResponse.json(
      {
        error: first?.message ?? "Noto'g'ri ma'lumot",
        field: path,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const supabase = createAdminClient();
    const { data: inserted, error } = await supabase
      .from("applications")
      .insert({
        passport_number: data.passport_number,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        birth_date: data.birth_date,
        position_id: data.position_id ?? null,
        position_title: data.position_title,
        // R2 object key'lar (URL emas) — adminga signed download URL yaratiladi
        cv_url: data.cv_url,
        passport_scan_url: data.passport_scan_url,
        diploma_url: data.diploma_url,
        photo_url: data.photo_url,
      })
      .select("id")
      .single();

    if (error) {
      // UNIQUE constraint (passport_number)
      const code = (error as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json(
          { error: "Bu pasport bilan ariza topshirilgan" },
          { status: 409 }
        );
      }
      console.error("[applications] insert error:", error);
      return NextResponse.json(
        { error: "Arizani saqlashda xatolik yuz berdi." },
        { status: 500 }
      );
    }

    if (!inserted) {
      return NextResponse.json(
        { error: "Arizani saqlashda xatolik yuz berdi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: inserted.id });
  } catch (err) {
    console.error("[applications] exception:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
