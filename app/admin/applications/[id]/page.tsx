import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationDetail } from "@/components/admin/application-detail";
import type { ApplicationRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <ApplicationDetail application={data as ApplicationRow} />;
}
