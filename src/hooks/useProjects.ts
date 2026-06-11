"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ProjectWithRelations {
  id: string; name: string; description?: string; status: string;
  pricing_type: string; fixed_price?: number; total_cost: number;
  start_date: string; delivery_date: string; google_drive_link?: string;
  notes?: string; created_at: string; progress: number;
  client?: { id: string; name: string; company?: string };
  tasks?: { id: string; status: string }[];
  team_members?: { team_member: { id: string; name: string } }[];
}

export function useProjects(filters?: { status?: string; search?: string }) {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("projects")
      .select(`
        *, client:clients(id,name,company),
        tasks(id,status),
        team_members:project_team_members(team_member:team_members(id,name))
      `)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
    if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

    const { data, error: err } = await query;
    if (err) { setError(err.message); setLoading(false); return; }

    const withProgress = (data || []).map((p) => {
      const tasks = p.tasks || [];
      const completed = tasks.filter((t: { status: string }) => t.status === "completed").length;
      return { ...p, progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0 };
    });

    setProjects(withProgress as ProjectWithRelations[]);
    setLoading(false);
  }, [filters?.status, filters?.search]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const refetch = () => loadProjects();
  return { projects, loading, error, refetch };
}
