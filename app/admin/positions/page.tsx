import { createClient } from "@/lib/supabase/server";
import { PositionsManager } from "@/components/admin/positions-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
      <AdminPageHeader
        title="Lavozimlar (Vakansiyalar)"
        description="Nomzodlar ariza topshirishi uchun ochiq bo'lgan lavozimlarni boshqarish"
      />

      <PositionsManager initialPositions={positions} />
    </div>
  );
}
