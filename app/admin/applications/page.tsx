import { createClient } from "@/lib/supabase/server";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type {
  ApplicationRow,
  ApplicationStatus,
  PositionRow,
} from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchParams {
  status?: string;
  position?: string;
  type?: string;
  q?: string;
  page?: string;
}

export default async function AdminApplicationsPage({
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
  const type = searchParams.type === "student" ? "student" : searchParams.type === "vacancy" ? "vacancy" : "";
  const q = searchParams.q ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  // So'rovni qurish
  let query = supabase
    .from("applications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (position) query = query.eq("position_id", position);
  if (type) query = query.eq("type", type);
  
  if (q) {
    const safe = q.replace(/[%,]/g, "");
    query = query.or(
      `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const [appsRes, positionsRes] = await Promise.all([
    query,
    supabase.from("positions").select("*").order("title"),
  ]);

  const applications: ApplicationRow[] =
    (appsRes.data as ApplicationRow[] | null) ?? [];
  const total = appsRes.count ?? 0;
  const positions: PositionRow[] =
    (positionsRes.data as PositionRow[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Arizalar</h1>
        <p className="text-muted-foreground">
          Barcha topshirilgan arizalarni ko'rib chiqish va boshqarish paneli
        </p>
      </div>

      <ApplicationsTable
        applications={applications}
        positions={positions}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status, position, type, q }}
      />
    </div>
  );
}
