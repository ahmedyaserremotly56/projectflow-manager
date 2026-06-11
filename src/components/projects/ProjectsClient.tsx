"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ExternalLink,
  Users,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_CONFIG, formatDate, formatCurrency, getInitials } from "@/lib/utils";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  total_cost: number;
  delivery_date: string;
  progress: number;
  tasks_count: number;
  client?: { id: string; name: string; company?: string };
  team_members?: { team_member: { id: string; name: string; avatar_url?: string } }[];
}

interface ProjectsClientProps {
  projects: ProjectRow[];
  clients: { id: string; name: string }[];
}

type SortField = "name" | "delivery_date" | "total_cost" | "progress";

export function ProjectsClient({ projects, clients }: ProjectsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("delivery_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...projects];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client?.name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (clientFilter !== "all") {
      result = result.filter((p) => p.client?.id === clientFilter);
    }

    result.sort((a, b) => {
      let valA: string | number = a[sortField] || 0;
      let valB: string | number = b[sortField] || 0;
      if (sortField === "name") {
        valA = a.name;
        valB = b.name;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, search, statusFilter, clientFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = sortDir === "asc" ? SortAsc : SortDesc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">المشاريع</h1>
          <p className="text-slate-500 text-sm mt-1">
            إدارة جميع المشاريع والمتابعة ({projects.length} مشروع)
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl shadow-sm">
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="بحث في المشاريع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-xl"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 rounded-xl">
              <Filter className="w-4 h-4 ml-2 text-slate-400" />
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="not_started">لم يبدأ</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="under_review">تحت المراجعة</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue placeholder="العميل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العملاء</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    اسم المشروع
                    {sortField === "name" && <SortIcon className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">العميل</th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("total_cost")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    التكلفة
                    {sortField === "total_cost" && <SortIcon className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("delivery_date")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    التسليم
                    {sortField === "delivery_date" && <SortIcon className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort("progress")}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    الإنجاز
                    {sortField === "progress" && <SortIcon className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">الفريق</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                    لا توجد مشاريع تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filtered.map((project) => {
                  const statusConfig = PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG];
                  const isOverdue =
                    project.status !== "completed" &&
                    project.status !== "cancelled" &&
                    new Date(project.delivery_date) < new Date();

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{project.name}</p>
                          <p className="text-xs text-slate-400">{project.tasks_count} مهمة</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-600">{project.client?.name}</p>
                        {project.client?.company && (
                          <p className="text-xs text-slate-400">{project.client.company}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-700 num">
                          {formatCurrency(project.total_cost)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm num ${isOverdue ? "text-red-500 font-medium" : "text-slate-600"}`}
                        >
                          {formatDate(project.delivery_date)}
                          {isOverdue && (
                            <span className="block text-xs text-red-400">متأخر!</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700 num">
                              {project.progress}%
                            </span>
                          </div>
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${project.progress}%`,
                                backgroundColor:
                                  project.progress >= 100
                                    ? "#10b981"
                                    : project.progress >= 50
                                    ? "#3b82f6"
                                    : "#f59e0b",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`status-badge ${statusConfig?.bgColor} ${statusConfig?.textColor}`}
                        >
                          {statusConfig?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2 space-x-reverse">
                          {(project.team_members || []).slice(0, 3).map((tm) => (
                            <div
                              key={tm.team_member.id}
                              className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                              title={tm.team_member.name}
                            >
                              {getInitials(tm.team_member.name)}
                            </div>
                          ))}
                          {(project.team_members || []).length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
                              +{(project.team_members || []).length - 3}
                            </div>
                          )}
                          {(project.team_members || []).length === 0 && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> لا يوجد
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-3.5 h-3.5" />
                            عرض
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
