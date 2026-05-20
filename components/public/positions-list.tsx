import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import type { PositionRow } from "@/lib/supabase/types";

interface PositionsListProps {
  positions: PositionRow[];
}

export function PositionsList({ positions }: PositionsListProps) {
  if (!positions.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Пока открытых вакансий нет. Скоро будут обновления.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {positions.map((pos) => (
        <Card key={pos.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                {pos.title}
              </CardTitle>
              <Badge variant="secondary">Открыта</Badge>
            </div>
            {pos.description ? (
              <CardDescription className="line-clamp-3">{pos.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="mt-auto text-xs text-muted-foreground">
            Нажмите кнопку ниже, чтобы подать заявку.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
