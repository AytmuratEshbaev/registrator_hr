import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/admin/dashboard-content";
import type { AdminApplication } from "@/components/admin/applications-table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Oxirgi arizalarni parallel ravishda olamiz
  const [studentLatestRes, vacancyLatestRes] = await Promise.all([
    supabase
      .from("student_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const studentLatest = (studentLatestRes.data ?? []).map((x) => ({ ...x, type: "student" as const }));
  const vacancyLatest = (vacancyLatestRes.data ?? []).map((x) => ({ ...x, type: "vacancy" as const }));

  const latest: AdminApplication[] = [...studentLatest, ...vacancyLatest]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Statistika uchun barcha arizalarni olamiz
  const [studentStatsRes, vacancyStatsRes] = await Promise.all([
    supabase
      .from("student_applications")
      .select("status, grade"),
    supabase
      .from("applications")
      .select("status, position_title"),
  ]);

  const studentStats = (studentStatsRes.data ?? []).map((x) => ({
    status: x.status,
    grade: x.grade,
    type: "student" as const,
  }));

  const vacancyStats = (vacancyStatsRes.data ?? []).map((x) => ({
    status: x.status,
    position_title: x.position_title,
    type: "vacancy" as const,
  }));

  const allData = [...studentStats, ...vacancyStats];

  // Hisob-kitoblar
  const total = allData.length;
  let studentCount = 0;
  let vacancyCount = 0;

  const statusCounts = {
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  };

  const gradeBreakdown = new Map<string, number>();
  const positionBreakdown = new Map<string, number>();

  for (const row of allData) {
    // Statuslarni hisoblash
    const status = row.status as keyof typeof statusCounts;
    if (status in statusCounts) {
      statusCounts[status]++;
    }

    // Turlarni hisoblash
    if (row.type === "student") {
      studentCount++;
      const grade = row.grade || "Noma'lum sinf";
      gradeBreakdown.set(grade, (gradeBreakdown.get(grade) ?? 0) + 1);
    } else if (row.type === "vacancy") {
      vacancyCount++;
      const pos = row.position_title || "Noma'lum lavozim";
      positionBreakdown.set(pos, (positionBreakdown.get(pos) ?? 0) + 1);
    }
  }

  const gradeEntries = Array.from(gradeBreakdown.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  
  const positionEntries = Array.from(positionBreakdown.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <DashboardContent
      total={total}
      studentCount={studentCount}
      vacancyCount={vacancyCount}
      statusCounts={statusCounts}
      latest={latest}
      gradeEntries={gradeEntries}
      positionEntries={positionEntries}
    />
  );
}
