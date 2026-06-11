import Link from "next/link";
import {
  PROJECT_STATUS_CONFIG,
  formatDate,
  formatCurrency,
  calculateProgress,
} from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface RecentProjectsProps {
  projects: {
    id: string;
    name: string;
    status: string;
    total_cost: number;
    delivery_date: string;
    client?: { name: string };
  }[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">آخر المشاريع</h3>
          <p className="text-xs text-slate-400 mt-0.5">المشاريع المضافة مؤخراً</p>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد مشاريع حتى الآن
          </div>
        ) : (
          projects.map((project) => {
            const statusConfig =
              PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG];
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig?.bgColor}`}
                  style={{
                    backgroundColor:
                      project.status === "completed"
                        ? "#10b981"
                        : project.status === "in_progress"
                        ? "#3b82f6"
                        : project.status === "under_review"
                        ? "#f59e0b"
                        : project.status === "cancelled"
                        ? "#ef4444"
                        : "#94a3b8",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {project.client?.name} • {formatDate(project.delivery_date)}
                  </p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-700 num">
                    {formatCurrency(project.total_cost)}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig?.bgColor} ${statusConfig?.textColor}`}
                  >
                    {statusConfig?.label}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
