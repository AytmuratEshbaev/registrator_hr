import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-bold">404 — Sahifa topilmadi</h1>
      <p className="text-muted-foreground">
        Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
      </p>
      <Button asChild>
        <Link href="/">Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  );
}
