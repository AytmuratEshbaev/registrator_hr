import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/public/hero-slider";
import { PositionsList } from "@/components/public/positions-list";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PositionRow } from "@/lib/supabase/types";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getActivePositions(): Promise<PositionRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[home] positions fetch error:", error);
      return [];
    }
    return (data ?? []) as PositionRow[];
  } catch (err) {
    console.error("[home] positions fetch exception:", err);
    return [];
  }
}

export default async function HomePage() {
  const positions = await getActivePositions();

  return (
    <div>
      {/* Слайдер */}
      <HeroSlider />

      {/* Вакансии */}
      <section id="positions" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Открытые вакансии</h2>
          <p className="text-muted-foreground">
            Выберите подходящую вам должность из списка ниже.
          </p>
        </div>
        <PositionsList positions={positions} />

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link href="/apply">
              Подать заявку
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
