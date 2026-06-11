"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ClientWithStats {
  id: string; name: string; phone: string; email: string;
  company?: string; notes?: string; created_at: string;
  total_projects: number; active_projects: number; total_revenue: number;
}

export function useClients() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*, projects(id, status, total_cost)")
      .order("name");

    setClients((data || []).map((c) => ({
      ...c,
      total_projects: c.projects?.length || 0,
      active_projects: c.projects?.filter((p: { status: string }) =>
        ["in_progress","under_review"].includes(p.status)).length || 0,
      total_revenue: c.projects
        ?.filter((p: { status: string }) => p.status === "completed")
        .reduce((s: number, p: { total_cost: number }) => s + (p.total_cost || 0), 0) || 0,
    })) as ClientWithStats[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  return { clients, loading, refetch: load };
}
