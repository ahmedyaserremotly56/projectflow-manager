import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, company")
    .order("name");

  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("id, name, job_title")
    .eq("status", "active")
    .order("name");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          المشاريع
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">مشروع جديد</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">إضافة مشروع جديد</h1>
        <p className="text-slate-500 text-sm mt-1">أدخل بيانات المشروع الجديد</p>
      </div>

      <ProjectForm clients={clients || []} teamMembers={teamMembers || []} />
    </div>
  );
}
