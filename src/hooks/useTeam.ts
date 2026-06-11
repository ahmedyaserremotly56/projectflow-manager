"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface TeamMemberWithStats {
  id: string; name: string; job_title: string; phone: string;
  email: string; status: string; avatar_url?: string; created_at: string;
  total_tasks: number; completed_tasks: number;
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMemberWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*, tasks(id, status)")
      .order("name");

    setMembers((data || []).map((m) => ({
      ...m,
      total_tasks: m.tasks?.length || 0,
      completed_tasks: m.tasks?.filter((t: { status: string }) => t.status === "completed").length || 0,
    })) as TeamMemberWithStats[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  return { members, loading, refetch: load };
}
