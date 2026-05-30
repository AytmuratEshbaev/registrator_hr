import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationDetail } from "@/components/admin/application-detail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  const supabase = createClient();

  // 1. O'quvchi arizalaridan izlab ko'ramiz
  const { data: studentData } = await supabase
    .from("student_applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (studentData) {
    return (
      <ApplicationDetail
        application={{
          ...studentData,
          type: "student",
        }}
      />
    );
  }

  // 2. Agar o'quvchilarda topilmasa, vakansiya arizalaridan izlaymiz
  const { data: vacancyData } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (vacancyData) {
    return (
      <ApplicationDetail
        application={{
          ...vacancyData,
          type: "vacancy",
        }}
      />
    );
  }

  // 3. Topilmasa notFound
  notFound();
}
