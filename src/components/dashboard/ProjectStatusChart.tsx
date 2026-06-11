"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StatusData {
  status: string;
  count: number;
  color: string;
}

interface ProjectStatusChartProps {
  data: StatusData[];
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">توزيع حالات المشاريع</h3>
        <p className="text-xs text-slate-400 mt-0.5">إجمالي {total} مشروع</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          لا توجد بيانات
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontFamily: "Cairo, sans-serif",
                direction: "rtl",
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ fontFamily: "Cairo, sans-serif", fontSize: "12px" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-600">{item.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 num">
                {item.count}
              </span>
              <span className="text-xs text-slate-400 num">
                ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
