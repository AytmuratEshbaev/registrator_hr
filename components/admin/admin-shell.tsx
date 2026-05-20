"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
