import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationDetail } from "@/components/admin/application-detail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminCandidateDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: vacancyData } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!vacancyData) {
    notFound();
  }

  return (
    <ApplicationDetail
      application={{
        ...vacancyData,
        type: "vacancy",
      }}
    />
  );
}
