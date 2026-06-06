import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validations/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidUploadKey } from "@/lib/r2/upload";
import type { PostgrestError } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  // Rate limit
  const rl = await rateLimit(`applications:${ip}`, { max: 5, windowMs: 60_000 });
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

  // Fayl kalitlari faqat server yaratgan naqshga mos bo'lishi shart (boshqa nomzod faylini
  // ko'rsatish yoki ixtiyoriy R2 kalitini saqlashning oldini oladi).
  if (data.type === "vacancy") {
    if (!isValidUploadKey(data.cv_url)) {
      return NextResponse.json(
        { error: "Rezyume (CV) fayli noto'g'ri. Iltimos, qaytadan yuklang.", field: "cv_url" },
        { status: 400 }
      );
    }
    for (const k of ["passport_scan_url", "diploma_url", "photo_url"] as const) {
      const val = data[k];
      if (val && !isValidUploadKey(val)) {
        return NextResponse.json(
          { error: "Yuklangan fayl noto'g'ri. Iltimos, qaytadan yuklang.", field: k },
          { status: 400 }
        );
      }
    }
  }

  try {
    const supabase = createAdminClient();
    let insertedId: string | null = null;
    let dbError: PostgrestError | null = null;

    if (data.type === "student") {
      const studentInsert = {
        passport_number: data.passport_number,
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name, // Sharifi
        phone: data.phone,
        phone_secondary: data.phone_secondary ?? null,
        grade: data.grade,
        preschool_prep: data.grade === "1" ? (data.preschool_prep ?? "no") : "no",
      };

      const { data: inserted, error } = await supabase
        .from("student_applications")
        .insert(studentInsert)
        .select("id")
        .single();

      if (inserted) insertedId = inserted.id;
      dbError = error;
    } else {
      const vacancyInsert = {
        passport_number: data.passport_number,
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name ?? null,
        phone: data.phone,
        phone_secondary: data.phone_secondary ?? null,
        position_id: data.position_id ?? null,
        position_title: data.position_title,
        cv_url: data.cv_url,
        passport_scan_url: data.passport_scan_url ?? null,
        diploma_url: data.diploma_url ?? null,
        photo_url: data.photo_url ?? null,
      };

      const { data: inserted, error } = await supabase
        .from("applications")
        .insert(vacancyInsert)
        .select("id")
        .single();

      if (inserted) insertedId = inserted.id;
      dbError = error;
    }

    if (dbError) {
      // UNIQUE constraint (passport_number)
      const code = (dbError as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.json(
          { error: "Ushbu pasport yoki guvohnoma raqami bo'yicha ariza allaqachon topshirilgan" },
          { status: 409 }
        );
      }
      console.error("[applications] insert error:", dbError);
      return NextResponse.json(
        { error: "Arizani saqlashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring." },
        { status: 500 }
      );
    }

    if (!insertedId) {
      return NextResponse.json(
        { error: "Arizani saqlashda xatolik yuz berdi (ma'lumot qaytmadi)." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: insertedId });
  } catch (err) {
    console.error("[applications] exception:", err);
    return NextResponse.json(
      { error: "Server xatoligi yuz berdi. Iltimos, keyinroq qayta urinib ko'ring." },
      { status: 500 }
    );
  }
}
