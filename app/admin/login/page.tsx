import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Tizimga kirish — ZEYIN mektebi",
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
