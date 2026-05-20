import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PassportCheckForm } from "@/components/forms/passport-check-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Ariza topshirish — Pasport tekshiruvi",
};

export default function ApplyPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Bosh sahifaga qaytish
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Ariza topshirish</CardTitle>
            <CardDescription>
              Boshlash uchun pasport raqamingizni kiriting. Tizim avval ariza
              topshirilganligini tekshiradi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassportCheckForm />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Pasport raqami noyob bo&apos;lishi kerak. Har bir nomzod faqat bir marta ariza topshira oladi.
        </p>
      </div>
    </div>
  );
}
