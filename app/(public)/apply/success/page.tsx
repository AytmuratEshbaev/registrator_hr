import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Ariza muvaffaqiyatli topshirildi",
};

export default function ApplySuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle>Arizangiz qabul qilindi!</CardTitle>
            <CardDescription>
              Tashrifingiz uchun rahmat. HR bo&apos;limimiz arizangizni ko&apos;rib chiqadi va siz bilan
              tez orada bog&apos;lanadi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/">Bosh sahifaga qaytish</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
