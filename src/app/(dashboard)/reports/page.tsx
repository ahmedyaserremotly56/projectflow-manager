import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "@/components/reports/ReportsClient";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: clients }, { data: members }] = await Promise.all([
    supabase.from("projects").select(`
      *, client:clients(name, company),
      tasks(id, status),
      team_members:project_team_members(team_member_id)
    `).order("created_at", { ascending: false }),
    supabase.from("clients").select("*, projects(id, status, total_cost)"),
    supabase.from("team_members").select("*, tasks(id, status)").eq("status", "active"),
  ]);

  const projectReports = (projects || []).map((p) => {
    const tasks = p.tasks || [];
    const completed = tasks.filter((t: { status: string }) => t.status === "completed").length;
    return {
      id: p.id,
      name: p.name,
      client_name: p.client?.name || "—",
      status: p.status,
      total_cost: p.total_cost,
      start_date: p.start_date,
      delivery_date: p.delivery_date,
      progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      team_count: (p.team_members || []).length,
    };
  });

  const clientReports = (clients || []).map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company || "—",
    total_projects: c.projects?.length || 0,
    active_projects: c.projects?.filter((p: { status: string }) =>
      ["in_progress", "under_review"].includes(p.status)
    ).length || 0,
    total_revenue: c.projects
      ?.filter((p: { status: string }) => p.status === "completed")
      .reduce((s: number, p: { total_cost: number }) => s + (p.total_cost || 0), 0) || 0,
  }));

  const teamReports = (members || []).map((m) => {
    const tasks = m.tasks || [];
    const completed = tasks.filter((t: { status: string }) => t.status === "completed").length;
    const inProgress = tasks.filter((t: { status: string }) => t.status === "in_progress").length;
    return {
      id: m.id,
      name: m.name,
      job_title: m.job_title,
      total_tasks: tasks.length,
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      completion_rate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  });

  return (
    <ReportsClient
      projectReports={projectReports}
      clientReports={clientReports}
      teamReports={teamReports}
    />
  );
}
