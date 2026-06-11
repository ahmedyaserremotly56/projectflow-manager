"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

interface MonthlyRevenueChartProps {
  data: MonthlyRevenueData[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-lg p-3"
        style={{ fontFamily: "Cairo, sans-serif", direction: "rtl" }}
      >
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <p className="text-sm font-bold text-blue-600 mt-1">
          {payload[0].value.toLocaleString("ar-EG")} ج.م
        </p>
      </div>
    );
  }
  return null;
};

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">الإيرادات الشهرية</h3>
          <p className="text-xs text-slate-400 mt-0.5">آخر 6 أشهر</p>
        </div>
        <div className="text-left">
          <p className="text-lg font-bold text-blue-600 num">
            {maxRevenue.toLocaleString("ar-EG")}
          </p>
          <p className="text-xs text-slate-400">أعلى شهر (ج.م)</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: "Cairo, sans-serif", fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
