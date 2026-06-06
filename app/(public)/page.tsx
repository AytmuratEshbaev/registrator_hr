import { createClient } from "@/lib/supabase/server";
import type { PositionRow } from "@/lib/supabase/types";
import { HomeContent } from "@/components/public/home-content";

export const dynamic = "force-dynamic";

async function getActivePositions(): Promise<PositionRow[]> {
  try {
    // Anon (RLS-cheklangan) client yetarli: positions_select_public faqat active=true ni ochadi.
    const supabase = createClient();
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("active", true)
      .order("title", { ascending: true });
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

interface HomePageProps {
  searchParams: {
    type?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const type = searchParams.type === "vacancy" ? "vacancy" : "student";
  const isStudent = type === "student";
  const positions = await getActivePositions();

  return <HomeContent isStudent={isStudent} type={type} positions={positions} />;
}
