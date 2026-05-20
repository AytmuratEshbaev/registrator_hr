import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/stats-cards";
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
import { APPLICATION_STATUSES } from "@/lib/constants";
import type { ApplicationRow, ApplicationStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type StatusCounts = Record<ApplicationStatus, number>;

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [{ count: totalCount }, latestRes, allStatusRes, positionsRes] =
    await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("applications").select("status"),
      supabase
        .from("applications")
        .select("position_title")
        .order("position_title"),
    ]);

  const total = totalCount ?? 0;
  const latest: ApplicationRow[] = (latestRes.data as ApplicationRow[] | null) ?? [];

  const counts: StatusCounts = {
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  };
  if (allStatusRes.data) {
    for (const row of allStatusRes.data as { status: ApplicationStatus }[]) {
      if (APPLICATION_STATUSES.includes(row.status)) counts[row.status]++;
    }
  }

  const positionBreakdown = new Map<string, number>();
  if (positionsRes.data) {
    for (const row of positionsRes.data as { position_title: string }[]) {
      const title = row.position_title || "Неизвестно";
      positionBreakdown.set(title, (positionBreakdown.get(title) ?? 0) + 1);
    }
  }
  const positionEntries = Array.from(positionBreakdown.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground">Общая статистика и последние заявки</p>
      </div>

      <StatsCards
        total={total}
        pending={counts.pending}
        reviewing={counts.reviewing}
        accepted={counts.accepted}
        rejected={counts.rejected}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Последние заявки</CardTitle>
              <CardDescription>Последние 5 поданных заявок</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/applications">Все</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {latest.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Пока заявок нет
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="hover:underline"
                        >
                          {formatName(app)}
                        </Link>
                      </TableCell>
                      <TableCell>{app.position_title}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDateTime(app.created_at)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>По должностям</CardTitle>
            <CardDescription>Распределение заявок</CardDescription>
          </CardHeader>
          <CardContent>
            {positionEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Нет данных
              </p>
            ) : (
              <ul className="space-y-3">
                {positionEntries.map(([title, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <li key={title} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate pr-2">{title}</span>
                        <span className="text-muted-foreground shrink-0">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
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
  );
}
