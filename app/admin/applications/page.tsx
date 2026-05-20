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
  const q = searchParams.q ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  // Build query
  let query = supabase
    .from("applications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (position) query = query.eq("position_id", position);
  if (q) {
    // escape % and , special chars by removing them — Supabase OR filter is comma-separated
    const safe = q.replace(/[%,]/g, "");
    query = query.or(
      `full_name.ilike.%${safe}%,email.ilike.%${safe}%,passport_number.ilike.%${safe}%`
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
        <h1 className="text-3xl font-bold tracking-tight">Arizalar</h1>
        <p className="text-muted-foreground">
          Topshirilgan barcha arizalarni ko'rish va boshqarish
        </p>
      </div>

      <ApplicationsTable
        applications={applications}
        positions={positions}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status, position, q }}
      />
    </div>
  );
}
