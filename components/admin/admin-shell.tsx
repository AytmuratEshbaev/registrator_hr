"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./sidebar";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <AdminTopbar />
        <div className="container mx-auto max-w-7xl px-4 md:px-6 pt-6 md:pt-8 pb-28">{children}</div>
      </main>
    </div>
  );
}
