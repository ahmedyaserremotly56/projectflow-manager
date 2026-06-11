import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const [{ data: projects }, { data: members }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("id, status, total_cost, delivery_date, created_at"),
    supabase.from("team_members").select("id, status"),
    supabase.from("clients").select("id"),
  ]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter((p) => p.status === "in_progress").length || 0,
    completedProjects: projects?.filter((p) => p.status === "completed").length || 0,
    overdueProjects: projects?.filter(
      (p) => !["completed", "cancelled"].includes(p.status) && new Date(p.delivery_date) < now
    ).length || 0,
    totalRevenue: projects
      ?.filter((p) => p.status === "completed")
      .reduce((s, p) => s + (p.total_cost || 0), 0) || 0,
    currentMonthRevenue: projects
      ?.filter((p) => {
        const d = new Date(p.created_at);
        return p.status === "completed" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, p) => s + (p.total_cost || 0), 0) || 0,
    totalMembers: members?.length || 0,
    activeMembers: members?.filter((m) => m.status === "active").length || 0,
    totalClients: clients?.length || 0,
  };

  return NextResponse.json({ data: stats });
}
