import Link from "next/link";
import { GraduationCap, Briefcase, ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-20 md:py-28 px-4">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-orange-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-2 animate-pulse">
            ✨ Zeyin School Qabul Platformasi
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Kelajak Yetakchilarining <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Ilk Qadami
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Zeyin School — zamonaviy texnologiyalar, chuqurlashtirilgan ta'lim tizimi va yuksak ma'naviyat uyg'unlashgan maskan. Biz bilan yorqin kelajak sari yo'l oling!
          </p>
        </div>
      </section>

      {/* Main Choice Cards Section */}
      <section className="container mx-auto max-w-5xl px-4 -mt-16 md:-mt-20 mb-16 relative z-20">
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Card 1: Student Admission */}
          <Card className="group relative overflow-hidden bg-white/95 border-slate-200/80 shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/40 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
            <CardHeader className="pt-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors duration-200">
                O'quvchilar Qabuli
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-2">
                1-sinfdan 11-sinfgacha bo'lgan o'quvchilar uchun ro'yxatdan o'tish va maktabga qabul arizasini topshirish.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-slate-600 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Sodda va tezkor ro'yxatdan o'tish</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Hech qanday fayl yoki hujjat talab etilmaydi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Ariza holatini istalgan vaqtda tekshirish</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pb-8 pt-4">
              <Button asChild size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                <Link href="/apply?type=student" className="flex items-center justify-center gap-2">
                  O'quvchi Qabuli Arizasi
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Vacancy Admission */}
          <Card className="group relative overflow-hidden bg-white/95 border-slate-200/80 shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 hover:-translate-y-1.5 transition-all duration-300 rounded-2xl flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-900" />
            <CardHeader className="pt-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-indigo-900 transition-colors duration-200">
                Vakansiyalar (Ishchilar Qabuli)
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-2">
                Zeyin School maktabining professional va ahil jamoasiga o'qituvchi yoki xodim sifatida qo'shilish uchun ariza topshirish.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-slate-600 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-950 shrink-0" />
                  <span>Ochiq pedagogik va ma'muriy lavozimlar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-950 shrink-0" />
                  <span>Faqat Rezyume (CV) yuklash orqali tezkor ariza</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-950 shrink-0" />
                  <span>Kasbiy va professional rivojlanish imkoniyati</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pb-8 pt-4">
              <Button asChild size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                <Link href="/apply?type=vacancy" className="flex items-center justify-center gap-2">
                  Ishga Joylashish Arizasi
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

        </div>
      </section>

      {/* Why Us / Benefits section */}
      <section className="bg-slate-100 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Nima uchun Zeyin School?</h2>
            <p className="text-slate-500 mt-2">Maktabimizning asosiy qadriyatlari va afzalliklari</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-850 text-lg mb-2">Xavfsiz Muhit</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Zamonaviy xavfsizlik va kuzatuv tizimlari bilan jihozlangan tinch hamda qulay maktab hududi.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-850 text-lg mb-2">Yuqori Sifatli Ta'lim</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Xalqaro standartlarga javob beradigan o'quv dasturlari va tajribali o'qituvchilar jamoasi.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-850 text-lg mb-2">Shaxsiy Yondashuv</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Har bir bolaning iqtidori va qiziqishlarini kashf etishga yo'naltirilgan individual e'tibor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
