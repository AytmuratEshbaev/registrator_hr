import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PositionsList } from "@/components/public/positions-list";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PositionRow } from "@/lib/supabase/types";
import { ArrowRight, ShieldCheck, FileText, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getActivePositions(): Promise<PositionRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[home] positions fetch error:", error);
      return [];
    }
    return (data ?? []) as PositionRow[];
  } catch (err) {
    console.error("[home] positions fetch exception:", err);
    return [];
  }
}

export default async function HomePage() {
  const positions = await getActivePositions();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Bizning jamoaga qo&apos;shiling
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Firma nomi &mdash; sohaning yetakchi kompaniyalaridan biri. Biz iste&apos;dodli
              mutaxassislarni ishga taklif etamiz va har bir xodimning kasbiy o&apos;sishi uchun
              sharoit yaratamiz. Tegishli lavozimni tanlang va onlayn ariza topshiring.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/apply">
                  Ariza topshirish
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#positions">Lavozimlarni ko&apos;rish</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Afzalliklar */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Xavfsiz va ishonchli</h3>
              <p className="text-sm text-muted-foreground">
                Sizning shaxsiy ma&apos;lumotlaringiz himoyalangan va faqat HR bo&apos;limi tomonidan
                ko&apos;rib chiqiladi.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Tez va qulay</h3>
              <p className="text-sm text-muted-foreground">
                Ariza topshirish bir necha daqiqada amalga oshiriladi &mdash; hujjatlaringizni
                yuklang va tasdiqlang.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Professional jamoa</h3>
              <p className="text-sm text-muted-foreground">
                Tajribali mutaxassislardan iborat do&apos;stona jamoaga qo&apos;shiling va o&apos;z
                imkoniyatlaringizni kengaytiring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lavozimlar */}
      <section id="positions" className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Mavjud lavozimlar</h2>
          <p className="text-muted-foreground">
            Quyidagi vakansiyalardan o&apos;zingizga mosini tanlang.
          </p>
        </div>
        <PositionsList positions={positions} />

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link href="/apply">
              Ariza topshirish
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
