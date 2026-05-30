import { createAdminClient } from "@/lib/supabase/admin";
import type { PositionRow } from "@/lib/supabase/types";
import { ApplicationForm } from "@/components/forms/application-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

async function getActivePositions(): Promise<PositionRow[]> {
  try {
    const supabase = createAdminClient();
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

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        
        {/* FORMA CARD (Sahifaning o'rtasida) */}
        <Card className="border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden bg-white/95">
          <div className={`h-2 w-full ${isStudent ? 'bg-orange-500' : 'bg-indigo-900'}`} />
          
          <CardHeader className="pt-8 px-6 md:px-8 flex flex-row items-center justify-center gap-3.5 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isStudent ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-900'} shadow-sm shrink-0`}>
              {isStudent ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <CardTitle className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              {isStudent ? "O'quvchi Qabul Formasi" : "Nomzod Ma'lumotlari shakli"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pb-8 px-6 md:px-8">
            <ApplicationForm type={type} positions={positions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
