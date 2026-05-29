import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationForm } from "@/components/forms/application-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { PASSPORT_REGEX } from "@/lib/constants";
import type { PositionRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ariza topshirish formasi — Zeyin School",
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
  searchParams: { passport?: string; type?: string };
}) {
  const type = searchParams.type === "student" ? "student" : searchParams.type === "vacancy" ? "vacancy" : null;
  const raw = (searchParams.passport ?? "").trim().toUpperCase();

  // Agar ma'lumotlar to'liq yoki to'g'ri bo'lmasa, qayta tekshiruv sahifasiga yo'naltiramiz
  if (!type || !raw || !PASSPORT_REGEX.test(raw)) {
    redirect(type ? `/apply?type=${type}` : "/");
  }

  const positions = await getActivePositions();
  const isStudent = type === "student";

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={`/apply?type=${type}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Orqaga
        </Link>

        <Card className="border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden">
          <div className={`h-2 w-full ${isStudent ? 'bg-orange-500' : 'bg-indigo-900'}`} />
          
          <CardHeader className="space-y-2 pt-8 px-6 md:px-8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isStudent ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-900'}`}>
                {isStudent ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                {isStudent ? "O'quvchi Qabuli Arizasi" : "Ishga Joylashish Arizasi (Vakansiya)"}
              </CardTitle>
            </div>
            
            <CardDescription className="text-slate-500 text-sm leading-relaxed pt-1">
              {isStudent
                ? "Iltimos, o'quvchining shaxsiy ma'lumotlarini hamda ota-onasi haqidagi ma'lumotlarni diqqat bilan to'ldiring. Barcha yulduzcha (*) bilan belgilangan maydonlar majburiy hisoblanadi."
                : "Iltimos, shaxsiy va professional ma'lumotlaringizni to'ldiring hamda rezyumeyingizni (CV) yuklang. Barcha yulduzcha (*) bilan belgilangan maydonlar majburiy hisoblanadi."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8 px-6 md:px-8">
            <ApplicationForm passport_number={raw} type={type} positions={positions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
