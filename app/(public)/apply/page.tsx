import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PassportCheckForm } from "@/components/forms/passport-check-form";
import { ArrowLeft, GraduationCap, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ariza topshirish — Zeyin School",
};

interface ApplyPageProps {
  searchParams: {
    type?: string;
  };
}

export default function ApplyPage({ searchParams }: ApplyPageProps) {
  const type = searchParams.type === "student" ? "student" : searchParams.type === "vacancy" ? "vacancy" : null;

  // Agar tur tanlanmagan bo'lsa, bosh sahifaga yo'naltiramiz
  if (!type) {
    redirect("/");
  }

  const isStudent = type === "student";

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-8rem)] flex items-center py-12 px-4">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Bosh sahifaga qaytish
        </Link>

        <Card className="border-slate-200/80 shadow-xl rounded-2xl overflow-hidden relative">
          <div className={`h-2 w-full ${isStudent ? 'bg-orange-500' : 'bg-indigo-900'}`} />
          
          <CardHeader className="space-y-3 pt-8 px-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isStudent ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-900'}`}>
                {isStudent ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {isStudent ? "O'quvchi Qabuli" : "Ishga Joylashish (Vakansiya)"}
              </CardTitle>
            </div>
            
            <CardDescription className="text-slate-500 text-sm leading-relaxed pt-1">
              {isStudent
                ? "Ariza berishni boshlash uchun o'quvchining pasport yoki tug'ilganlik haqidagi guvohnoma raqamini kiriting. Tizim ariza oldin topshirilmaganligini tekshiradi."
                : "Ariza berishni boshlash uchun pasport seriyasi va raqamini kiriting. Tizim avval ariza topshirganligingizni tekshiradi."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8 px-6">
            <PassportCheckForm type={type} />
          </CardContent>
        </Card>

        <p className="text-xs text-slate-400 text-center leading-relaxed">
          {isStudent
            ? "Hujjat raqami takrorlanmas bo'lishi lozim. Har bir o'quvchi uchun faqat bir marotaba ariza topshirish mumkin."
            : "Pasport raqami takrorlanmas bo'lishi lozim. Har bir nomzod faqat bir marotaba ariza topshirishi mumkin."}
        </p>
      </div>
    </div>
  );
}
