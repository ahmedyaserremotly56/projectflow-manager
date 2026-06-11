import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      client:clients(*),
      tasks(*, assignee:team_members(id, name, job_title)),
      team_members:project_team_members(team_member:team_members(id, name, job_title, avatar_url)),
      pricing_tasks(*)
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: allMembers } = await supabase
    .from("team_members")
    .select("id, name, job_title")
    .eq("status", "active")
    .order("name");

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((t: { status: string }) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <ProjectDetailClient
      project={{ ...project, progress, completed_tasks: completedTasks }}
      allMembers={allMembers || []}
    />
  );
}
