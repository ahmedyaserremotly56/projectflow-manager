"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, Edit, Trash2, Phone, Mail, Briefcase,
  Loader2, X, Check, Users, CheckCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getInitials, MEMBER_STATUS_CONFIG } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  job_title: string;
  phone: string;
  email: string;
  status: string;
  avatar_url?: string;
  created_at: string;
}

interface TeamClientProps {
  members: Member[];
}

const EMPTY = { name: "", job_title: "", phone: "", email: "", status: "active" };

export function TeamClient({ members: initial }: TeamClientProps) {
  const { toast } = useToast();
  const supabase = createClient();

  const [members, setMembers] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let list = members;
    if (statusFilter !== "all") list = list.filter((m) => m.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.job_title.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, search, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ name: m.name, job_title: m.job_title, phone: m.phone, email: m.email, status: m.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.job_title || !form.phone || !form.email) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSaving(true);

    if (editing) {
      const { error } = await supabase.from("team_members").update(form).eq("id", editing.id);
      if (!error) {
        setMembers((prev) => prev.map((m) => m.id === editing.id ? { ...m, ...form } : m));
        toast({ title: "تم تعديل بيانات العضو" });
      } else {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      }
    } else {
      const { data, error } = await supabase.from("team_members").insert(form).select().single();
      if (!error && data) {
        setMembers((prev) => [data as Member, ...prev]);
        toast({ title: "تم إضافة العضو بنجاح" });
      } else {
        toast({ title: "خطأ", description: error?.message || "فشل الإضافة", variant: "destructive" });
      }
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: "لا يمكن حذف عضو مرتبط بمشاريع", variant: "destructive" });
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "تم حذف العضو" });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await supabase.from("team_members").update({ status: newStatus }).eq("id", id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m));
  };

  const activeCount = members.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">أعضاء الفريق</h1>
          <p className="text-slate-500 text-sm mt-1">
            {members.length} عضو إجمالي · {activeCount} نشط
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl shadow-sm">
          <Plus className="w-4 h-4" /> إضافة عضو
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="بحث في الفريق..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الجميع</SelectItem>
            <SelectItem value="active">نشط فقط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>لا يوجد أعضاء يطابقون البحث</p>
          </div>
        ) : (
          filtered.map((member) => {
            const statusConf = MEMBER_STATUS_CONFIG[member.status as keyof typeof MEMBER_STATUS_CONFIG];
            return (
              <div key={member.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover group text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {getInitials(member.name)}
                  </div>
                  <span className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${member.status === "active" ? "bg-green-400" : "bg-slate-300"}`} />
                </div>

                <p className="text-base font-bold text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-1">
                  <Briefcase className="w-3 h-3" /> {member.job_title}
                </p>

                <div className="mt-3 space-y-1 text-right">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center">
                    <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="num">{member.phone}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center truncate">
                    <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </p>
                </div>

                {/* Status badge */}
                <div className="mt-3">
                  <span className={`status-badge ${statusConf.bgColor} ${statusConf.textColor}`}>
                    {member.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {statusConf.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(member)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleStatus(member.id, member.status)}
                    className={`p-2 rounded-xl transition-colors ${member.status === "active" ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50" : "text-slate-400 hover:text-green-500 hover:bg-green-50"}`}
                    title={member.status === "active" ? "تعطيل العضو" : "تفعيل العضو"}
                  >
                    {member.status === "active" ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(member.id, member.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل بيانات العضو" : "إضافة عضو جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">الاسم الكامل *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="أحمد محمد" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">الوظيفة *</Label>
              <Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="مطور واجهة أمامية" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-medium">رقم الهاتف *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01012345678" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">البريد الإلكتروني *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editing ? "حفظ التعديلات" : "إضافة العضو"}
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowModal(false)}>
              <X className="w-4 h-4" /> إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
