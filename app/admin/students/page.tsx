import { createClient } from "@/lib/supabase/server";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type {
  ApplicationStatus,
} from "@/lib/supabase/types";
import type { AdminApplication } from "@/components/admin/applications-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchParams {
  status?: string;
  q?: string;
  page?: string;
}

export default async function AdminStudentsPage({
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

  const q = searchParams.q ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("student_applications").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[%,]/g, "");
    query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,passport_number.ilike.%${safe}%`);
  }
  query = query.order("created_at", { ascending: false }).range(from, to);
  const res = await query;
  const applications: AdminApplication[] = (res.data ?? []).map((x) => ({ ...x, type: "student" as const }));
  const total = res.count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="O'quvchilar arizalari"
        description="Barcha topshirilgan o'quvchi qabuli arizalarini ko'rib chiqish va boshqarish paneli"
      />

      <ApplicationsTable
        applications={applications}
        positions={[]}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status, position: "", type: "student", q }}
        mode="student"
      />
    </div>
  );
}
