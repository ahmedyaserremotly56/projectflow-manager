import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("client_id");
  const search = searchParams.get("search");

  let query = supabase
    .from("projects")
    .select(`
      *,
      client:clients(id, name, company, phone, email),
      tasks(id, status),
      team_members:project_team_members(
        team_member:team_members(id, name, job_title, avatar_url)
      ),
      pricing_tasks(*)
    `)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const projectsWithProgress = (data || []).map((p) => {
    const tasks = p.tasks || [];
    const completed = tasks.filter((t: { status: string }) => t.status === "completed").length;
    return {
      ...p,
      progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      tasks_count: tasks.length,
      completed_tasks: completed,
    };
  });

  return NextResponse.json({ data: projectsWithProgress });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { pricing_tasks, team_member_ids, ...projectData } = body;

  const { data: project, error } = await supabase
    .from("projects")
    .insert(projectData)
    .select("id")
    .single();

  if (error || !project) return NextResponse.json({ error: error?.message }, { status: 500 });

  // Insert pricing tasks if task_based
  if (pricing_tasks?.length > 0 && projectData.pricing_type === "task_based") {
    await supabase.from("pricing_tasks").insert(
      pricing_tasks.map((t: { name: string; price: number }) => ({ ...t, project_id: project.id }))
    );
  }

  // Assign team members
  if (team_member_ids?.length > 0) {
    await supabase.from("project_team_members").insert(
      team_member_ids.map((id: string) => ({ project_id: project.id, team_member_id: id }))
    );
  }

  return NextResponse.json({ data: project }, { status: 201 });
}
