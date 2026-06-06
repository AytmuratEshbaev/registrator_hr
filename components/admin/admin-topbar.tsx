"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/public/logo";
import { SidebarContent } from "./sidebar";

/** Mobil (md'dan kichik) ekranlar uchun yuqori panel + chiqib chiquvchi menyu (drawer). */
export function AdminTopbar() {
  const [open, setOpen] = useState(false);

  // Drawer ochiq bo'lganda fon scroll'ini bloklaymiz.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 backdrop-blur px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menyuni ochish"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 active:scale-95 transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo size="sm" href="/admin/dashboard" className="h-8" />
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Fon (overlay) */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Chiquvchi panel */}
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-card shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="flex justify-end p-2 border-b">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menyuni yopish"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
