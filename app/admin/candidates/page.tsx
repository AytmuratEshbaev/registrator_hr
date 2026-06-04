import { createClient } from "@/lib/supabase/server";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type {
  ApplicationStatus,
  PositionRow,
} from "@/lib/supabase/types";
import type { AdminApplication } from "@/components/admin/applications-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchParams {
  status?: string;
  position?: string;
  q?: string;
  page?: string;
}

export default async function AdminCandidatesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();

  const status = (
    searchParams.status &&
    (APPLICATION_STATUSES as readonly string[]).includes(searchParams.status)
      ? searchParams.status
      : ""
  ) as ApplicationStatus | "";

  const position = searchParams.position ?? "";
  const q = searchParams.q ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const positionsRes = await supabase.from("positions").select("*").order("title");
  const positions: PositionRow[] = (positionsRes.data as PositionRow[] | null) ?? [];

  let query = supabase.from("applications").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (position) query = query.eq("position_id", position);
  if (q) {
    const safe = q.replace(/[%,]/g, "");
    query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
  }
  query = query.order("created_at", { ascending: false }).range(from, to);
  const res = await query;
  const applications: AdminApplication[] = (res.data ?? []).map((x) => ({ ...x, type: "vacancy" as const }));
  const total = res.count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nomzodlar arizalari"
        description="Barcha topshirilgan ishga kirish/o'qituvchilik arizalarini ko'rib chiqish va boshqarish paneli"
      />

      <ApplicationsTable
        applications={applications}
        positions={positions}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status, position, type: "vacancy", q }}
        mode="vacancy"
      />
    </div>
  );
}
