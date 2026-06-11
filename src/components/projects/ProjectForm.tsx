"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, DollarSign, ListTodo, Users } from "lucide-react";

interface PricingTaskRow { name: string; description: string; price: number; }

interface ProjectFormProps {
  clients: { id: string; name: string; company?: string }[];
  teamMembers: { id: string; name: string; job_title: string }[];
  initialData?: {
    id: string; name: string; description?: string; client_id: string;
    start_date: string; delivery_date: string; google_drive_link?: string;
    notes?: string; status: string; pricing_type: string; fixed_price?: number;
  };
  initialSelectedMembers?: string[];
}

export function ProjectForm({ clients, teamMembers, initialData, initialSelectedMembers = [] }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const isEdit = !!initialData;

  const [loading, setLoading] = useState(false);
  const [pricingType, setPricingType] = useState(initialData?.pricing_type || "fixed");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(initialSelectedMembers);
  const [pricingTasks, setPricingTasks] = useState<PricingTaskRow[]>([
    { name: "", description: "", price: 0 },
  ]);

  const totalTaskCost = pricingTasks.reduce((sum, t) => sum + Number(t.price || 0), 0);

  const addPricingTask = () => setPricingTasks([...pricingTasks, { name: "", description: "", price: 0 }]);
  const removePricingTask = (i: number) => setPricingTasks(pricingTasks.filter((_, idx) => idx !== i));
  const updatePricingTask = (i: number, field: keyof PricingTaskRow, value: string | number) =>
    setPricingTasks(pricingTasks.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  const toggleMember = (id: string) =>
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const projectData = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || null,
      client_id: form.get("client_id") as string,
      start_date: form.get("start_date") as string,
      delivery_date: form.get("delivery_date") as string,
      google_drive_link: (form.get("google_drive_link") as string) || null,
      notes: (form.get("notes") as string) || null,
      status: form.get("status") as string,
      pricing_type: pricingType,
      fixed_price: pricingType === "fixed" ? Number(form.get("fixed_price")) : null,
      total_cost: pricingType === "fixed" ? Number(form.get("fixed_price")) : totalTaskCost,
    };

    let projectId = initialData?.id;

    if (isEdit) {
      const { error } = await supabase.from("projects").update(projectData).eq("id", initialData!.id);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
        setLoading(false); return;
      }
    } else {
      const { data, error } = await supabase.from("projects").insert(projectData).select("id").single();
      if (error || !data) {
        toast({ title: "خطأ", description: error?.message || "فشل إنشاء المشروع", variant: "destructive" });
        setLoading(false); return;
      }
      projectId = data.id;
    }

    if (pricingType === "task_based" && projectId) {
      await supabase.from("pricing_tasks").delete().eq("project_id", projectId);
      const validTasks = pricingTasks.filter((t) => t.name.trim());
      if (validTasks.length > 0) {
        await supabase.from("pricing_tasks").insert(validTasks.map((t) => ({ ...t, project_id: projectId })));
      }
    }

    if (projectId) {
      await supabase.from("project_team_members").delete().eq("project_id", projectId);
      if (selectedMembers.length > 0) {
        await supabase.from("project_team_members").insert(
          selectedMembers.map((mid) => ({ project_id: projectId, team_member_id: mid }))
        );
      }
    }

    toast({ title: isEdit ? "تم التعديل بنجاح" : "تم إضافة المشروع بنجاح" });
    router.push(projectId ? `/projects/${projectId}` : "/projects");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">١</span>
          بيانات المشروع الأساسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name" className="font-medium">اسم المشروع *</Label>
            <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="أدخل اسم المشروع" className="rounded-xl" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description" className="font-medium">وصف المشروع</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description} placeholder="وصف تفصيلي..." rows={3} className="rounded-xl resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">العميل *</Label>
            <Select name="client_id" defaultValue={initialData?.client_id} required>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-medium">حالة المشروع *</Label>
            <Select name="status" defaultValue={initialData?.status || "not_started"}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">لم يبدأ</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="under_review">تحت المراجعة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date" className="font-medium">تاريخ الاستلام *</Label>
            <Input id="start_date" name="start_date" type="date" defaultValue={initialData?.start_date} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_date" className="font-medium">تاريخ التسليم *</Label>
            <Input id="delivery_date" name="delivery_date" type="date" defaultValue={initialData?.delivery_date} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="google_drive_link" className="font-medium">رابط Google Drive</Label>
            <Input id="google_drive_link" name="google_drive_link" type="url" defaultValue={initialData?.google_drive_link || ""} placeholder="https://drive.google.com/..." className="rounded-xl" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes" className="font-medium">ملاحظات</Label>
            <Textarea id="notes" name="notes" defaultValue={initialData?.notes} placeholder="ملاحظات إضافية..." rows={2} className="rounded-xl resize-none" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">٢</span>
          التسعير
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button type="button" onClick={() => setPricingType("fixed")}
            className={`p-4 rounded-xl border-2 text-right transition-all ${pricingType === "fixed" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
            <DollarSign className={`w-5 h-5 mb-2 ${pricingType === "fixed" ? "text-blue-600" : "text-slate-400"}`} />
            <p className={`text-sm font-semibold ${pricingType === "fixed" ? "text-blue-700" : "text-slate-600"}`}>سعر ثابت</p>
            <p className="text-xs text-slate-400 mt-0.5">قيمة واحدة للمشروع كاملاً</p>
          </button>
          <button type="button" onClick={() => setPricingType("task_based")}
            className={`p-4 rounded-xl border-2 text-right transition-all ${pricingType === "task_based" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
            <ListTodo className={`w-5 h-5 mb-2 ${pricingType === "task_based" ? "text-blue-600" : "text-slate-400"}`} />
            <p className={`text-sm font-semibold ${pricingType === "task_based" ? "text-blue-700" : "text-slate-600"}`}>تسعير المهام</p>
            <p className="text-xs text-slate-400 mt-0.5">سعر لكل مهمة على حدة</p>
          </button>
        </div>

        {pricingType === "fixed" ? (
          <div className="space-y-2">
            <Label htmlFor="fixed_price" className="font-medium">السعر الإجمالي (ج.م) *</Label>
            <Input id="fixed_price" name="fixed_price" type="number" min="0" step="0.01"
              defaultValue={initialData?.fixed_price} placeholder="0.00" className="rounded-xl"
              required={pricingType === "fixed"} />
          </div>
        ) : (
          <div className="space-y-4">
            {pricingTasks.map((task, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <Label className="text-xs text-slate-500">اسم المهمة *</Label>
                  <Input value={task.name} onChange={(e) => updatePricingTask(i, "name", e.target.value)}
                    placeholder="اسم المهمة" className="rounded-lg text-sm" required />
                </div>
                <div className="col-span-12 sm:col-span-5 space-y-1">
                  <Label className="text-xs text-slate-500">الوصف</Label>
                  <Input value={task.description} onChange={(e) => updatePricingTask(i, "description", e.target.value)}
                    placeholder="وصف المهمة" className="rounded-lg text-sm" />
                </div>
                <div className="col-span-10 sm:col-span-2 space-y-1">
                  <Label className="text-xs text-slate-500">السعر (ج.م)</Label>
                  <Input type="number" min="0" value={task.price}
                    onChange={(e) => updatePricingTask(i, "price", Number(e.target.value))}
                    placeholder="0" className="rounded-lg text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-end">
                  {pricingTasks.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePricingTask(i)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addPricingTask}
              className="w-full gap-2 rounded-xl border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600">
              <Plus className="w-4 h-4" /> إضافة مهمة تسعير
            </Button>
            <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4 border border-blue-200">
              <span className="text-sm font-semibold text-blue-700">إجمالي تكلفة المشروع</span>
              <span className="text-lg font-bold text-blue-700 num">{totalTaskCost.toLocaleString("ar-EG")} ج.م</span>
            </div>
          </div>
        )}
      </div>

      {/* Team */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">٣</span>
          <Users className="w-4 h-4 text-blue-600" /> توزيع الفريق
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {teamMembers.map((member) => (
            <button key={member.id} type="button" onClick={() => toggleMember(member.id)}
              className={`p-3 rounded-xl border-2 text-right transition-all ${
                selectedMembers.includes(member.id) ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white"
              }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold mb-2 ${
                selectedMembers.includes(member.id) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {member.name.charAt(0)}
              </div>
              <p className={`text-xs font-semibold truncate ${selectedMembers.includes(member.id) ? "text-blue-700" : "text-slate-700"}`}>
                {member.name.split(" ")[0]}
              </p>
              <p className="text-xs text-slate-400 truncate">{member.job_title}</p>
            </button>
          ))}
        </div>
        {selectedMembers.length > 0 && (
          <p className="text-xs text-blue-600 mt-3 font-medium">تم اختيار {selectedMembers.length} عضو</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">إلغاء</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-2" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : (isEdit ? "حفظ التعديلات" : "إنشاء المشروع")}
        </Button>
      </div>
    </form>
  );
}
