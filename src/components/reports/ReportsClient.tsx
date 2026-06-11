"use client";

import { useState } from "react";
import { FileBarChart, Download, FolderKanban, UserCheck, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS_CONFIG, formatCurrency, formatDate } from "@/lib/utils";

interface ProjectReport {
  id: string; name: string; client_name: string; status: string;
  total_cost: number; start_date: string; delivery_date: string;
  progress: number; team_count: number;
}
interface ClientReport {
  id: string; name: string; company: string; total_projects: number;
  active_projects: number; total_revenue: number;
}
interface TeamReport {
  id: string; name: string; job_title: string; total_tasks: number;
  completed_tasks: number; in_progress_tasks: number; completion_rate: number;
}

interface ReportsClientProps {
  projectReports: ProjectReport[];
  clientReports: ClientReport[];
  teamReports: TeamReport[];
}

type Tab = "projects" | "revenue" | "clients" | "team";

export function ReportsClient({ projectReports, clientReports, teamReports }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("projects");

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map((row) => keys.map((k) => `"${row[k] ?? ""}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "projects", label: "المشاريع", icon: FolderKanban },
    { key: "revenue", label: "الأرباح", icon: TrendingUp },
    { key: "clients", label: "العملاء", icon: UserCheck },
    { key: "team", label: "أداء الفريق", icon: Users },
  ];

  // Revenue summary
  const totalRevenue = projectReports.filter((p) => p.status === "completed").reduce((s, p) => s + p.total_cost, 0);
  const activeRevenue = projectReports.filter((p) => ["in_progress", "under_review"].includes(p.status)).reduce((s, p) => s + p.total_cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">التقارير</h1>
          <p className="text-slate-500 text-sm mt-1">تقارير تفصيلية عن أداء المشاريع والفريق</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl"
          onClick={() => {
            if (activeTab === "projects") exportCSV(projectReports as unknown as Record<string, unknown>[], "تقرير-المشاريع");
            if (activeTab === "clients") exportCSV(clientReports as unknown as Record<string, unknown>[], "تقرير-العملاء");
            if (activeTab === "team") exportCSV(teamReports as unknown as Record<string, unknown>[], "تقرير-الفريق");
          }}
        >
          <Download className="w-4 h-4" /> تصدير Excel
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Projects Report */}
      {activeTab === "projects" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-500" /> تقرير المشاريع
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">
                {projectReports.length} مشروع
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {["المشروع", "العميل", "الحالة", "التكلفة", "الاستلام", "التسليم", "الإنجاز", "الفريق"].map((h) => (
                    <th key={h} className="px-4 py-3 text-sm whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projectReports.map((p) => {
                  const sc = PROJECT_STATUS_CONFIG[p.status as keyof typeof PROJECT_STATUS_CONFIG];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{p.client_name}</td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${sc?.bgColor} ${sc?.textColor}`}>{sc?.label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 num whitespace-nowrap">{formatCurrency(p.total_cost)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 num whitespace-nowrap">{formatDate(p.start_date)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 num whitespace-nowrap">{formatDate(p.delivery_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-20">
                          <div className="flex-1 progress-bar-track">
                            <div className="progress-bar-fill bg-blue-500" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 num">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600 num">{p.team_count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {activeTab === "revenue" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "إجمالي الإيرادات المحققة", value: formatCurrency(totalRevenue), color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "إيرادات المشاريع النشطة (متوقعة)", value: formatCurrency(activeRevenue), color: "text-blue-600", bg: "bg-blue-50" },
              { label: "إجمالي المشاريع", value: `${projectReports.length} مشروع`, color: "text-slate-700", bg: "bg-slate-50" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-slate-100`}>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color} num`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-700">تفاصيل الإيرادات حسب المشروع</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["المشروع", "العميل", "الحالة", "التكلفة الإجمالية", "ملاحظة"].map((h) => (
                      <th key={h} className="px-4 py-3 text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projectReports
                    .filter((p) => p.status !== "cancelled")
                    .sort((a, b) => b.total_cost - a.total_cost)
                    .map((p) => {
                      const sc = PROJECT_STATUS_CONFIG[p.status as keyof typeof PROJECT_STATUS_CONFIG];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 text-sm font-medium text-slate-700">{p.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{p.client_name}</td>
                          <td className="px-4 py-3">
                            <span className={`status-badge ${sc?.bgColor} ${sc?.textColor}`}>{sc?.label}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold num">
                            <span className={p.status === "completed" ? "text-emerald-600" : "text-blue-600"}>
                              {formatCurrency(p.total_cost)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {p.status === "completed" ? "✓ محقق" : "جاري التحصيل"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-slate-700">الإجمالي</td>
                    <td className="px-4 py-3 text-base font-bold text-emerald-600 num">
                      {formatCurrency(totalRevenue + activeRevenue)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Clients Report */}
      {activeTab === "clients" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-700">تقرير العملاء</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {["اسم العميل", "الشركة", "إجمالي المشاريع", "المشاريع النشطة", "إجمالي الإيرادات"].map((h) => (
                    <th key={h} className="px-4 py-3 text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clientReports.sort((a, b) => b.total_revenue - a.total_revenue).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{c.company}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-slate-700 num">{c.total_projects}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-blue-600 num">{c.active_projects}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 num">{formatCurrency(c.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team Report */}
      {activeTab === "team" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-700">تقرير أداء الفريق</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  {["العضو", "الوظيفة", "إجمالي المهام", "مكتملة", "جارية", "معدل الإنجاز"].map((h) => (
                    <th key={h} className="px-4 py-3 text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teamReports.sort((a, b) => b.completion_rate - a.completion_rate).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{m.job_title}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-slate-700 num">{m.total_tasks}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-green-600 num">{m.completed_tasks}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-blue-600 num">{m.in_progress_tasks}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 progress-bar-track max-w-24">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${m.completion_rate}%`,
                              backgroundColor: m.completion_rate >= 80 ? "#10b981" : m.completion_rate >= 50 ? "#3b82f6" : "#f59e0b",
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 num">{m.completion_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
