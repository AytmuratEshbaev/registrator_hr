"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/public/logo";

export function Header() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "vacancy" ? "vacancy" : "student";
  const isStudent = type === "student";

  return (
    <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Chap tarafda: Sarlavha (Katta ekranlar uchun) */}
        <div className="w-1/3 hidden md:block text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2.5">
            <span className={`w-2 h-6 rounded ${isStudent ? 'bg-orange-500' : 'bg-indigo-900'}`} />
            {isStudent ? "O'quvchilar qabuli" : "Vakansiyalar"}
          </h2>
        </div>
        
        {/* Markazda: Maktab nomi (Logotip) */}
        <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center md:justify-center justify-start">
          <Logo size="lg" />
        </div>
        
        {/* O'ng tarafda: Vakansiyalar / O'quvchi qabuli o'tish tugmasi */}
        <div className="w-full md:w-1/3 flex justify-end items-center">
          <Link
            href={isStudent ? "/?type=vacancy" : "/?type=student"}
            className={`text-xs md:text-sm font-bold px-4 py-2.5 md:px-5 md:py-3 rounded-xl transition-all shadow-md text-white ${
              isStudent
                ? "bg-indigo-900 hover:bg-indigo-950 shadow-indigo-900/15"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/15"
            }`}
          >
            {isStudent ? "Vakansiyalar" : "O'quvchi qabuli"}
          </Link>
        </div>
        
      </div>
    </header>
  );
}
