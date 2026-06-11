import { createClient } from "@/lib/supabase/server";
import { ClientsClient } from "@/components/clients/ClientsClient";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select(`
      *,
      projects:projects(id, status, total_cost)
    `)
    .order("created_at", { ascending: false });

  const clientsWithStats = (clients || []).map((c) => ({
    ...c,
    total_projects: c.projects?.length || 0,
    active_projects: c.projects?.filter((p: { status: string }) =>
      ["in_progress", "under_review"].includes(p.status)
    ).length || 0,
    total_revenue: c.projects
      ?.filter((p: { status: string }) => p.status === "completed")
      .reduce((sum: number, p: { total_cost: number }) => sum + (p.total_cost || 0), 0) || 0,
  }));

  return <ClientsClient clients={clientsWithStats} />;
}
