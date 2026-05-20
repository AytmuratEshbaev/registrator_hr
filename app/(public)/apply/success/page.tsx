import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Ariza muvaffaqiyatli topshirildi",
};

export default function ApplySuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id;

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
          <CardContent className="space-y-4">
            {id ? (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-center">
                <div className="text-muted-foreground text-xs">Ariza raqami</div>
                <div className="font-mono font-semibold break-all">{id}</div>
              </div>
            ) : null}

            <div className="text-sm text-muted-foreground text-center">
              Iltimos, ariza raqamini saqlab qo&apos;ying. Savollaringiz bo&apos;lsa, biz bilan
              bog&apos;lanishingiz mumkin.
            </div>

            <div className="flex justify-center pt-2">
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
