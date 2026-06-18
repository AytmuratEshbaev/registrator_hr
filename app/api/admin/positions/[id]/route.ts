import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { positionUpdateSchema } from "@/lib/validations/position";
import type { PositionUpdate } from "@/lib/supabase/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = positionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: PositionUpdate = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description_uz !== undefined)
    updates.description_uz = parsed.data.description_uz;
  if (parsed.data.description_qq !== undefined)
    updates.description_qq = parsed.data.description_qq;
  if (parsed.data.description_ru !== undefined)
    updates.description_ru = parsed.data.description_ru;
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Нет полей для обновления" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("positions")
    .update(updates)
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ position: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
