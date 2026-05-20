import { FileText, Clock, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  total: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
}

const ITEMS = [
  {
    key: "total" as const,
    label: "Всего заявок",
    icon: FileText,
    className: "text-foreground",
  },
  {
    key: "pending" as const,
    label: "Новые",
    icon: Clock,
    className: "text-blue-600",
  },
  {
    key: "reviewing" as const,
    label: "На рассмотрении",
    icon: Eye,
    className: "text-amber-600",
  },
  {
    key: "accepted" as const,
    label: "Принятые",
    icon: CheckCircle2,
    className: "text-green-600",
  },
  {
    key: "rejected" as const,
    label: "Отклонённые",
    icon: XCircle,
    className: "text-red-600",
  },
];

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${item.className}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{props[item.key]}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
