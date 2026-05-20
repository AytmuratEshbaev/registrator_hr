import Link from "next/link";
import { Logo } from "@/components/public/logo";

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size="md" />
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
