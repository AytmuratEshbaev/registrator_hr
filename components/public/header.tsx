import Link from "next/link";
import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">Название компании</span>
            <span className="text-xs text-muted-foreground">HR регистрация</span>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/admin/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Вход
          </Link>
        </nav>
      </div>
    </header>
  );
}
