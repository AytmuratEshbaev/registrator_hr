import Link from "next/link";
import { Logo } from "@/components/public/logo";

export function Header() {
  return (
    <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Kattalashtirilgan Maktab nomi / Logotipi */}
        <Logo size="lg" />
        
        {/* Katta ekranlar uchun kichik navigatsiya menyusi */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
          <Link
            href="/apply?type=student"
            className="hover:text-orange-500 transition-colors"
          >
            O'quvchi qabuli
          </Link>
          <Link
            href="/apply?type=vacancy"
            className="hover:text-indigo-950 transition-colors"
          >
            Vakansiyalar
          </Link>
        </nav>

        {/* O'ng tarafdagi tugmalar */}
        <div className="flex items-center gap-4">
          
          {/* Mobil ekranlar uchun ixcham navigatsiya havolalari */}
          <nav className="flex md:hidden items-center gap-3.5 text-xs font-bold text-slate-500 mr-1">
            <Link
              href="/apply?type=student"
              className="hover:text-orange-500 transition-colors"
            >
              Qabul
            </Link>
            <Link
              href="/apply?type=vacancy"
              className="hover:text-indigo-950 transition-colors"
            >
              Vakansiyalar
            </Link>
          </nav>
          
          <Link
            href="/admin/login"
            className="text-xs font-bold px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-800 shadow-sm"
          >
            Kirish
          </Link>
        </div>
        
      </div>
    </header>
  );
}
