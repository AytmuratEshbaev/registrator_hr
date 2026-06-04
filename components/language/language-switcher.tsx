"use client";

import { Languages } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useLanguage } from "@/components/language/language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
      <Languages className="h-4 w-4 text-slate-500" aria-hidden="true" />
      <span className="sr-only">Til</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className="bg-transparent text-xs font-bold outline-none"
        aria-label="Til"
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label} ({item.nativeName})
          </option>
        ))}
      </select>
    </label>
  );
}
