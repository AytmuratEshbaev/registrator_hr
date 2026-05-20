import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Заявка успешно подана",
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
            <CardTitle>Ваша заявка принята!</CardTitle>
            <CardDescription>
              Спасибо за обращение. HR-отдел рассмотрит вашу заявку и свяжется с вами
              в ближайшее время.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/">Вернуться на главную</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
