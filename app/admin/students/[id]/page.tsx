import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationDetail } from "@/components/admin/application-detail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminStudentDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: studentData } = await supabase
    .from("student_applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!studentData) {
    notFound();
  }

  return (
    <ApplicationDetail
      application={{
        ...studentData,
        type: "student",
      }}
    />
  );
}
