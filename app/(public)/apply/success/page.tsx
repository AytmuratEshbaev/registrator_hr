import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Ariza muvaffaqiyatli yuborildi — Zeyin School",
};

export default function ApplySuccessPage() {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-8rem)] flex items-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <Card className="border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden text-center p-6 md:p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardHeader className="space-y-2 p-0">
            <CardTitle className="text-2xl font-bold text-slate-900">Arizangiz qabul qilindi!</CardTitle>
            <CardDescription className="text-slate-500 text-sm leading-relaxed">
              Murojaatingiz uchun tashakkur. Maktab ma'muriyati arizangizni tez orada ko'rib chiqadi va siz bilan bog'lanadi.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-0">
            <Button asChild size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl">
              <Link href="/">Bosh sahifaga qaytish</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
