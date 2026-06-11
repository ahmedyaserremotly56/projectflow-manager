import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/projects/ProjectForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: clients }, { data: teamMembers }, { data: currentTeam }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("clients").select("id, name, company").order("name"),
      supabase.from("team_members").select("id, name, job_title").eq("status", "active").order("name"),
      supabase.from("project_team_members").select("team_member_id").eq("project_id", id),
    ]);

  if (!project) notFound();

  const selectedMemberIds = (currentTeam || []).map((m) => m.team_member_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowRight className="w-4 h-4" /> تفاصيل المشروع
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">تعديل</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">تعديل المشروع</h1>
        <p className="text-slate-500 text-sm mt-1">{project.name}</p>
      </div>

      <ProjectForm
        clients={clients || []}
        teamMembers={teamMembers || []}
        initialData={project}
        initialSelectedMembers={selectedMemberIds}
      />
    </div>
  );
}
