import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      client:clients(*),
      tasks(*, assignee:team_members(id, name, job_title)),
      team_members:project_team_members(team_member:team_members(*)),
      pricing_tasks(*)
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const { pricing_tasks, team_member_ids, ...projectData } = body;

  const { data, error } = await supabase
    .from("projects")
    .update(projectData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (pricing_tasks !== undefined) {
    await supabase.from("pricing_tasks").delete().eq("project_id", id);
    if (pricing_tasks.length > 0) {
      await supabase.from("pricing_tasks").insert(
        pricing_tasks.map((t: { name: string; price: number }) => ({ ...t, project_id: id }))
      );
    }
  }

  if (team_member_ids !== undefined) {
    await supabase.from("project_team_members").delete().eq("project_id", id);
    if (team_member_ids.length > 0) {
      await supabase.from("project_team_members").insert(
        team_member_ids.map((mid: string) => ({ project_id: id, team_member_id: mid }))
      );
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
