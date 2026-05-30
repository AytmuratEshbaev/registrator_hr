import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validations/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { ApplicationInsert } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  // Rate limit
  const rl = rateLimit(`applications:${ip}`, { max: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Urinishlar soni ko'payib ketdi. Iltimos, bir daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "So'rov ma'lumoti noto'g'ri formatda" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first?.path?.join(".") ?? "";
    return NextResponse.json(
      {
        error: first?.message ?? "Noto'g'ri ma'lumotlar",
        field: path,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Dinamik ravishda turga qarab yoziladigan maydonlarni shakllantiramiz
  const insertData: ApplicationInsert = {
    type: data.type,
    passport_number: data.passport_number,
    first_name: data.first_name,
    last_name: data.last_name,
    middle_name: data.middle_name ?? null,
    phone: data.phone,
    phone_secondary: data.phone_secondary ?? null,
    birth_date: data.birth_date ?? null,
    passport_scan_url: data.passport_scan_url ?? null,
    diploma_url: data.diploma_url ?? null,
    photo_url: data.photo_url ?? null,
  };

  if (data.type === "student") {
    insertData.parent_name = data.parent_name;
    insertData.grade = data.grade;
    insertData.position_id = null;
    insertData.position_title = null;
    insertData.cv_url = null;
  } else {
    insertData.parent_name = null;
    insertData.grade = null;
    insertData.position_id = data.position_id ?? null;
    insertData.position_title = data.position_title;
    insertData.cv_url = data.cv_url;
  }

  try {
    const supabase = createAdminClient();
    const { data: inserted, error } = await supabase
      .from("applications")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      // UNIQUE constraint (passport_number)
      const code = (error as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json(
          { error: "Ushbu pasport yoki guvohnoma raqami bo'yicha ariza allaqachon topshirilgan" },
          { status: 409 }
        );
      }
      console.error("[applications] insert error:", error);
      return NextResponse.json(
        { error: `Arizani saqlashda xatolik: ${error.message} (${error.details || error.hint || ''})` },
        { status: 500 }
      );
    }

    if (!inserted) {
      return NextResponse.json(
        { error: "Arizani saqlashda xatolik yuz berdi (ma'lumot qaytmadi)." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: inserted.id });
  } catch (err) {
    console.error("[applications] exception:", err);
    return NextResponse.json(
      { error: `Server xatoligi: ${err instanceof Error ? err.message : "Noma'lum xatolik"}` },
      { status: 500 }
    );
  }
}
