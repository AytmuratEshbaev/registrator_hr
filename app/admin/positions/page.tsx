import { createClient } from "@/lib/supabase/server";
import { PositionsManager } from "@/components/admin/positions-manager";
import type { PositionRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminPositionsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("positions")
    .select("*")
    .order("created_at", { ascending: false });

  const positions: PositionRow[] = (data as PositionRow[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lavozimlar (Vakansiyalar)</h1>
        <p className="text-muted-foreground">
          Nomzodlar ariza topshirishi uchun ochiq bo'lgan lavozimlarni boshqarish
        </p>
      </div>

      <PositionsManager initialPositions={positions} />
    </div>
  );
}
