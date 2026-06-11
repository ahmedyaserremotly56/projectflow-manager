"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, ExternalLink, Edit, Trash2, Plus, Check,
  Clock, AlertCircle, Users, DollarSign, Calendar, Phone,
  Building, FileText, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  PROJECT_STATUS_CONFIG, TASK_STATUS_CONFIG, formatDate,
  formatCurrency, getInitials,
} from "@/lib/utils";

interface Task {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  assigned_to?: string;
  assignee?: { id: string; name: string; job_title: string };
}

interface ProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
    pricing_type: string;
    fixed_price?: number;
    total_cost: number;
    start_date: string;
    delivery_date: string;
    google_drive_link?: string;
    notes?: string;
    progress: number;
    completed_tasks: number;
    created_at: string;
    client?: { name: string; phone: string; email: string; company?: string };
    tasks?: Task[];
    team_members?: { team_member: { id: string; name: string; job_title: string; avatar_url?: string } }[];
    pricing_tasks?: { id: string; name: string; description?: string; price: number }[];
  };
  allMembers: { id: string; name: string; job_title: string }[];
}

export function ProjectDetailClient({ project, allMembers }: ProjectDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const statusConfig = PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG];
  const isOverdue =
    project.status !== "completed" &&
    project.status !== "cancelled" &&
    new Date(project.delivery_date) < new Date();

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Task form submit
  const handleTaskSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingTask(true);
    const form = new FormData(e.currentTarget);
    const taskData = {
      project_id: project.id,
      name: form.get("name") as string,
      assigned_to: form.get("assigned_to") as string || null,
      start_date: form.get("start_date") as string,
      end_date: form.get("end_date") as string,
      status: form.get("status") as string,
    };

    if (editingTask) {
      const { data, error } = await supabase
        .from("tasks").update(taskData).eq("id", editingTask.id).select("*, assignee:team_members(id,name,job_title)").single();
      if (!error && data) {
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? data as Task : t)));
        toast({ title: "تم تعديل المهمة" });
      }
    } else {
      const { data, error } = await supabase
        .from("tasks").insert(taskData).select("*, assignee:team_members(id,name,job_title)").single();
      if (!error && data) {
        setTasks((prev) => [...prev, data as Task]);
        toast({ title: "تم إضافة المهمة" });
      }
    }

    setShowTaskModal(false);
    setEditingTask(null);
    setSavingTask(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast({ title: "تم حذف المهمة" });
  };

  const handleDeleteProject = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    setDeletingProject(true);
    await supabase.from("projects").delete().eq("id", project.id);
    toast({ title: "تم حذف المشروع" });
    router.push("/projects");
    router.refresh();
  };

  const quickStatusChange = async (taskId: string, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/projects" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowRight className="w-4 h-4" /> المشاريع
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700 truncate">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
            <span className={`status-badge ${statusConfig?.bgColor} ${statusConfig?.textColor}`}>
              {statusConfig?.label}
            </span>
            {isOverdue && (
              <span className="status-badge bg-red-100 text-red-600">
                <AlertCircle className="w-3 h-3" /> متأخر
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-slate-500 text-sm mt-2 max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {project.google_drive_link && (
            <a href={project.google_drive_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <ExternalLink className="w-4 h-4" /> Drive
              </Button>
            </a>
          )}
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Edit className="w-4 h-4" /> تعديل
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteProject}
            disabled={deletingProject}
            className="gap-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="w-4 h-4" /> حذف
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Client Info */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500" /> معلومات العميل
          </h3>
          <p className="text-base font-bold text-slate-800">{project.client?.name}</p>
          {project.client?.company && (
            <p className="text-sm text-slate-500 mt-0.5">{project.client.company}</p>
          )}
          <div className="mt-3 space-y-1.5">
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="num">{project.client?.phone}</span>
            </p>
            <p className="text-sm text-slate-600 flex items-center gap-2 truncate">
              <span className="w-3.5 h-3.5 text-slate-400">@</span>
              {project.client?.email}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> التواريخ
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">تاريخ الاستلام</p>
              <p className="text-sm font-semibold text-slate-700 num">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">تاريخ التسليم</p>
              <p className={`text-sm font-semibold num ${isOverdue ? "text-red-500" : "text-slate-700"}`}>
                {formatDate(project.delivery_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">تاريخ الإنشاء</p>
              <p className="text-sm font-semibold text-slate-700 num">{formatDate(project.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" /> التكلفة والإنجاز
          </h3>
          <p className="text-2xl font-bold text-blue-600 num">{formatCurrency(project.total_cost)}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {project.pricing_type === "fixed" ? "سعر ثابت" : "تسعير المهام"}
          </p>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">نسبة الإنجاز</span>
              <span className="text-sm font-bold text-slate-700 num">{progress}%</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? "#10b981" : progress >= 50 ? "#3b82f6" : "#f59e0b",
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 num">
              {completedCount} / {tasks.length} مهمة مكتملة
            </p>
          </div>
        </div>
      </div>

      {/* Team & Pricing Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> أعضاء الفريق المكلفون
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
              {(project.team_members || []).length} عضو
            </span>
          </h3>
          <div className="space-y-2">
            {(project.team_members || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">لم يتم تعيين أعضاء</p>
            ) : (
              (project.team_members || []).map(({ team_member: m }) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(m.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.job_title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing tasks if task_based */}
        {project.pricing_type === "task_based" && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" /> بنود التسعير
            </h3>
            <div className="space-y-2">
              {(project.pricing_tasks || []).map((pt) => (
                <div key={pt.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{pt.name}</p>
                    {pt.description && <p className="text-xs text-slate-400">{pt.description}</p>}
                  </div>
                  <span className="text-sm font-bold text-blue-600 num">{formatCurrency(pt.price)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 mt-2">
                <span className="text-sm font-bold text-blue-700">الإجمالي</span>
                <span className="text-base font-bold text-blue-700 num">{formatCurrency(project.total_cost)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {project.notes && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> الملاحظات
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{project.notes}</p>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              قائمة المهام
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {tasks.length} مهمة
              </span>
            </h3>
            {tasks.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5 num">
                {completedCount} مكتملة · {tasks.length - completedCount} متبقية
              </p>
            )}
          </div>
          <Button
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl"
          >
            <Plus className="w-4 h-4" /> إضافة مهمة
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">لا توجد مهام بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-2.5 text-right text-sm">المهمة</th>
                  <th className="px-3 py-2.5 text-right text-sm">المسؤول</th>
                  <th className="px-3 py-2.5 text-right text-sm">البداية</th>
                  <th className="px-3 py-2.5 text-right text-sm">النهاية</th>
                  <th className="px-3 py-2.5 text-right text-sm">الحالة</th>
                  <th className="px-3 py-2.5 text-right text-sm">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map((task) => {
                  const taskStatus = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG];
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="text-sm font-medium text-slate-700">{task.name}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                              {task.assignee.name.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600">{task.assignee.name.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-500 num">{formatDate(task.start_date)}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-500 num">{formatDate(task.end_date)}</td>
                      <td className="px-3 py-2.5">
                        <select
                          value={task.status}
                          onChange={(e) => quickStatusChange(task.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${taskStatus?.bgColor} ${taskStatus?.textColor}`}
                        >
                          <option value="not_started">لم تبدأ</option>
                          <option value="in_progress">جاري التنفيذ</option>
                          <option value="completed">مكتملة</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={(o) => { setShowTaskModal(o); if (!o) setEditingTask(null); }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-name" className="font-medium">اسم المهمة *</Label>
              <Input id="task-name" name="name" defaultValue={editingTask?.name} required placeholder="أدخل اسم المهمة" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">المسؤول عنها</Label>
              <Select name="assigned_to" defaultValue={editingTask?.assigned_to || ""}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر عضو الفريق" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— بدون تعيين —</SelectItem>
                  {allMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name} · {m.job_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-medium">تاريخ البداية *</Label>
                <Input name="start_date" type="date" defaultValue={editingTask?.start_date} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">تاريخ النهاية *</Label>
                <Input name="end_date" type="date" defaultValue={editingTask?.end_date} required className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">الحالة</Label>
              <Select name="status" defaultValue={editingTask?.status || "not_started"}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">لم تبدأ</SelectItem>
                  <SelectItem value="in_progress">جاري التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 flex-row-reverse">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2" disabled={savingTask}>
                {savingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingTask ? "حفظ التعديل" : "إضافة المهمة"}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>
                <X className="w-4 h-4" /> إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
