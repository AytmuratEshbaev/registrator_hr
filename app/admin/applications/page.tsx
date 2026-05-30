import { createClient } from "@/lib/supabase/server";
import { ApplicationsTable } from "@/components/admin/applications-table";
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

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let applications: AdminApplication[] = [];
  let total = 0;

  const positionsRes = await supabase.from("positions").select("*").order("title");
  const positions: PositionRow[] = (positionsRes.data as PositionRow[] | null) ?? [];

  if (type === "student") {
    let query = supabase.from("student_applications").select("*", { count: "exact" });
    if (status) query = query.eq("status", status);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }
    query = query.order("created_at", { ascending: false }).range(from, to);
    const res = await query;
    applications = (res.data ?? []).map((x) => ({ ...x, type: "student" as const }));
    total = res.count ?? 0;
  } else if (type === "vacancy") {
    let query = supabase.from("applications").select("*", { count: "exact" });
    if (status) query = query.eq("status", status);
    if (position) query = query.eq("position_id", position);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }
    query = query.order("created_at", { ascending: false }).range(from, to);
    const res = await query;
    applications = (res.data ?? []).map((x) => ({ ...x, type: "vacancy" as const }));
    total = res.count ?? 0;
  } else {
    // Both types: query both, merge, sort, and slice
    let studentQuery = supabase.from("student_applications").select("*");
    if (status) studentQuery = studentQuery.eq("status", status);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      studentQuery = studentQuery.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }

    let vacancyQuery = supabase.from("applications").select("*");
    if (status) vacancyQuery = vacancyQuery.eq("status", status);
    if (position) vacancyQuery = vacancyQuery.eq("position_id", position);
    if (q) {
      const safe = q.replace(/[%,]/g, "");
      vacancyQuery = vacancyQuery.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
    }

    const [studentsRes, vacanciesRes] = await Promise.all([studentQuery, vacancyQuery]);
    
    const students = (studentsRes.data ?? []).map((x) => ({ ...x, type: "student" as const }));
    const vacancies = (vacanciesRes.data ?? []).map((x) => ({ ...x, type: "vacancy" as const }));
    
    const combined = [...students, ...vacancies].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    total = combined.length;
    applications = combined.slice(from, to + 1);
  }

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
