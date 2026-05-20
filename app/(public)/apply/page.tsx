import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PassportCheckForm } from "@/components/forms/passport-check-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Подать заявку — Проверка паспорта",
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
          Вернуться на главную
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Подать заявку</CardTitle>
            <CardDescription>
              Для начала введите номер паспорта. Система проверит, не подавали ли
              вы заявку ранее.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassportCheckForm />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Номер паспорта должен быть уникальным. Каждый кандидат может подать заявку только один раз.
        </p>
      </div>
    </div>
  );
}
