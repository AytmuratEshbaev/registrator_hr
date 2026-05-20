import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 });
  }

  const parsed = positionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Noto'g'ri ma'lumot", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: PositionUpdate = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description ?? null;
  if (parsed.data.active !== undefined) updates.active = parsed.data.active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Yangilanadigan maydon yo'q" },
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
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

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

  return NextResponse.json({ ok: true });
}
