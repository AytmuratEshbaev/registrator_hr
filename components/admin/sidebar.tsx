"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FileText, Briefcase, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Boshqaruv paneli", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Arizalar", icon: FileText },
  { href: "/admin/positions", label: "Lavozimlar", icon: Briefcase },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error("Chiqishda xato");
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      toast({
        title: "Xato",
        description: err instanceof Error ? err.message : "Chiqishda xato yuz berdi",
        variant: "destructive",
      });
      setLoggingOut(false);
    }
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card sticky top-0">
      <div className="border-b px-6 py-5">
        <h1 className="text-lg font-bold tracking-tight">HR Admin</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Boshqaruv paneli</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Spinner className="mr-3" />
          ) : (
            <LogOut className="mr-3 h-4 w-4" />
          )}
          Chiqish
        </Button>
      </div>
    </aside>
  );
}
