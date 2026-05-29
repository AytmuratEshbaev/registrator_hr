import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatName } from "@/lib/utils";
import type { ApplicationRow } from "@/lib/supabase/types";
import { GraduationCap, Briefcase, FileText, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Barcha arizalarni, oxirgi 5 ta arizani parallel ravishda olamiz
  const [latestRes, allRes] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("applications")
      .select("type, status, position_title, grade"),
  ]);

  const latest: ApplicationRow[] = (latestRes.data as ApplicationRow[] | null) ?? [];
  const allData = allRes.data ?? [];

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
    <div className="space-y-6">
      {/* Sahifa sarlavhasi */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Boshqaruv paneli</h1>
        <p className="text-muted-foreground">Zeyin School arizalar statistikasi va oxirgi arizalar</p>
      </div>

      {/* Statistika kartalari (Yuqori qism) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Jami arizalar */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Jami arizalar</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">Platformadagi barcha arizalar</p>
          </CardContent>
        </Card>

        {/* O'quvchi arizalari */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">O'quvchi qabuli</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-orange-600">{studentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Maktabga topshirgan o'quvchilar
            </p>
          </CardContent>
        </Card>

        {/* Vakansiya arizalari */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Nomzodlar (Vakansiya)</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-900">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-900">{vacancyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ishga topshirgan mutaxassislar
            </p>
          </CardContent>
        </Card>

        {/* Ko'rib chiqilishi kutilayotganlar */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Yangi arizalar</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-500">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Ko'rib chiqilishi kutilmoqda</p>
          </CardContent>
        </Card>
      </div>

      {/* Arizalar ro'yxati va taqsimot */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chap panel: Oxirgi arizalar */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b py-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Oxirgi topshirilgan arizalar</CardTitle>
              <CardDescription className="text-xs">Oxirgi topshirilgan 5 ta ariza ro'yxati</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold border-slate-200">
              <Link href="/admin/applications">Barchasi</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {latest.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">
                Hozircha arizalar topshirilmagan
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-slate-800">F.I.SH.</TableHead>
                    <TableHead className="font-bold text-slate-800">Turi</TableHead>
                    <TableHead className="font-bold text-slate-800">Sinf / Lavozim</TableHead>
                    <TableHead className="font-bold text-slate-800">Sana</TableHead>
                    <TableHead className="font-bold text-slate-800">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.map((app) => {
                    const isAppStudent = app.type === "student";
                    return (
                      <TableRow key={app.id} className="hover:bg-slate-50/30">
                        <TableCell className="font-bold text-slate-900">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="hover:underline"
                          >
                            {formatName(app)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            isAppStudent 
                              ? "bg-orange-50 text-orange-700 border border-orange-100" 
                              : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}>
                            {isAppStudent ? "O'quvchi" : "Vakansiya"}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {isAppStudent ? app.grade : app.position_title}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                          {formatDateTime(app.created_at)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* O'ng panel: Taqsimot */}
        <div className="space-y-6">
          {/* O'quvchilar sinflar kesimida */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-base font-bold text-slate-800">O'quvchilar sinflar kesimida</CardTitle>
              <CardDescription className="text-xs">Sinflarga taqsimlanishi</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
              {gradeEntries.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center font-medium">
                  Ma'lumot mavjud emas
                </p>
              ) : (
                <ul className="space-y-3">
                  {gradeEntries.map(([grade, count]) => {
                    const pct = studentCount > 0 ? Math.round((count / studentCount) * 100) : 0;
                    return (
                      <li key={grade} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate pr-2">{grade}</span>
                          <span className="text-slate-500 shrink-0">
                            {count} ta ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden border">
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Ishchilar lavozimlar kesimida */}
          <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-base font-bold text-slate-800">Ishchilar lavozimlar kesimida</CardTitle>
              <CardDescription className="text-xs">Lavozimlarga taqsimlanishi</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
              {positionEntries.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center font-medium">
                  Ma'lumot mavjud emas
                </p>
              ) : (
                <ul className="space-y-3">
                  {positionEntries.map(([title, count]) => {
                    const pct = vacancyCount > 0 ? Math.round((count / vacancyCount) * 100) : 0;
                    return (
                      <li key={title} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 truncate pr-2">{title}</span>
                          <span className="text-slate-500 shrink-0">
                            {count} ta ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden border">
                          <div
                            className="h-full bg-indigo-900"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
