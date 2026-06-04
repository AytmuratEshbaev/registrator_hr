"use client";

import { useLanguage } from "@/components/language/language-provider";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t(title)}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">
          {t(description)}
        </p>
      )}
    </div>
  );
}
