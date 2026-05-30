import { createAdminClient } from "@/lib/supabase/admin";
import type { PositionRow } from "@/lib/supabase/types";
import { ApplicationForm } from "@/components/forms/application-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Phone, Clock, HelpCircle } from "lucide-react";

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
      <div className="max-w-5xl w-full mx-auto">
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          
          {/* Chap qism (Forma): 2 ta ustunni oladi */}
          <div className="lg:col-span-2">
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

          {/* O'ng qism (Yordam va Bog'lanish paneli): 1 ta ustunni oladi */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200/80 shadow-xl rounded-2xl overflow-hidden bg-white">
              <div className={`h-1.5 w-full ${isStudent ? 'bg-orange-500/80' : 'bg-indigo-900/80'}`} />
              
              <CardHeader className="pt-6 pb-4 px-6">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isStudent ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-900'}`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-extrabold text-slate-800 tracking-tight">
                    Qo'llab-quvvatlash
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-5">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Agarda ro'yxatdan o'tishda qiyinchilikka duch kelsangiz, tizimda muammo yuzaga kelsa yoki qo'shimcha savollaringiz bo'lsa, istalgan vaqtda maktab ma'muriyati bilan bog'lanishingiz mumkin.
                </p>

                {/* Katta va ko'zga tashlanadigan bog'lanish tugmasi */}
                <a 
                  href="tel:+998931234567"
                  className={`group p-4 rounded-xl border flex items-center gap-3.5 shadow-sm transition-all duration-300 ${
                    isStudent 
                      ? 'bg-orange-50/20 border-orange-200/40 hover:bg-orange-50/50 hover:border-orange-200' 
                      : 'bg-indigo-50/20 border-indigo-200/40 hover:bg-indigo-50/50 hover:border-indigo-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm ${
                    isStudent ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-900'
                  }`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Telefon raqamimiz</p>
                    <p className={`text-base font-black tracking-tight ${
                      isStudent ? 'text-orange-600' : 'text-indigo-900'
                    }`}>
                      +998 93 123 45 67
                    </p>
                  </div>
                </a>

                {/* Qo'shimcha foydali ma'lumotlar */}
                <div className="pt-4 border-t border-slate-100 space-y-3 text-[11px] text-slate-500 font-bold">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Ish vaqti: Dush - Shan (9:00 - 18:00)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-slate-400 font-black shrink-0 text-[10px]">
                      i
                    </div>
                    <span className="leading-snug font-semibold text-slate-400">Arizalar avtomatik ravishda saqlanadi va real vaqt rejimida ko'rib chiqiladi.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
