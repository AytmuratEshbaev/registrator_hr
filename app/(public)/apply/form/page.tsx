import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationForm } from "@/components/forms/application-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { PASSPORT_REGEX } from "@/lib/constants";
import type { PositionRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Подать заявку — Форма",
};

async function getActivePositions(): Promise<PositionRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("active", true)
      .order("title", { ascending: true });
    if (error) {
      console.error("[apply/form] positions fetch error:", error);
      return [];
    }
    return (data ?? []) as PositionRow[];
  } catch (err) {
    console.error("[apply/form] positions fetch exception:", err);
    return [];
  }
}

export default async function ApplyFormPage({
  searchParams,
}: {
  searchParams: { passport?: string };
}) {
  const raw = (searchParams.passport ?? "").trim().toUpperCase();
  if (!raw || !PASSPORT_REGEX.test(raw)) {
    redirect("/apply");
  }

  const positions = await getActivePositions();

  return (
    <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/apply"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Данные заявки</CardTitle>
            <CardDescription>
              Заполните поля формы и загрузите необходимые документы. Поля, отмеченные
              звездочкой (*), обязательны для заполнения.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationForm passport_number={raw} positions={positions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
