import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "@/components/projects/ProjectsClient";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase
      .from("projects")
      .select(`
        *,
        client:clients(id, name, company),
        tasks(id, status),
        team_members:project_team_members(
          team_member:team_members(id, name, avatar_url)
        )
      `)
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  // Calculate progress for each project
  const projectsWithProgress = (projects || []).map((p) => {
    const tasks = p.tasks || [];
    const completed = tasks.filter((t: { status: string }) => t.status === "completed").length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return { ...p, progress, tasks_count: tasks.length, completed_tasks: completed };
  });

  return (
    <ProjectsClient
      projects={projectsWithProgress}
      clients={clients || []}
    />
  );
}
