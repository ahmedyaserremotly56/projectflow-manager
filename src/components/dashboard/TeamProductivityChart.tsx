"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ProductivityData {
  name: string;
  completed: number;
  inProgress: number;
}

export function TeamProductivityChart() {
  const [data, setData] = useState<ProductivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: members } = await supabase
        .from("team_members")
        .select("id, name")
        .eq("status", "active")
        .limit(6);

      if (!members) { setLoading(false); return; }

      const productivity: ProductivityData[] = await Promise.all(
        members.map(async (member) => {
          const { data: tasks } = await supabase
            .from("tasks")
            .select("status")
            .eq("assigned_to", member.id);

          return {
            name: member.name.split(" ")[0],
            completed: tasks?.filter((t) => t.status === "completed").length || 0,
            inProgress: tasks?.filter((t) => t.status === "in_progress").length || 0,
          };
        })
      );

      setData(productivity.filter((d) => d.completed + d.inProgress > 0));
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm h-64 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">إنتاجية الفريق</h3>
        <p className="text-xs text-slate-400 mt-0.5">المهام المكتملة والجارية</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          لا توجد بيانات كافية
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "Cairo, sans-serif", fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontFamily: "Cairo, sans-serif",
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ fontFamily: "Cairo, sans-serif", fontSize: "12px" }}>
                  {value === "completed" ? "مكتملة" : "جارية"}
                </span>
              )}
            />
            <Bar dataKey="completed" name="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inProgress" name="inProgress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
