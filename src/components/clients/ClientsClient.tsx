"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, Edit, Trash2, Phone, Mail, Building,
  Loader2, X, Check, FolderKanban, DollarSign, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface ClientRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  total_projects: number;
  active_projects: number;
  total_revenue: number;
  created_at: string;
}

interface ClientsClientProps {
  clients: ClientRow[];
}

const EMPTY_FORM = { name: "", phone: "", email: "", company: "", notes: "" };

export function ClientsClient({ clients: initial }: ClientsClientProps) {
  const { toast } = useToast();
  const supabase = createClient();

  const [clients, setClients] = useState(initial);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (client: ClientRow) => {
    setEditing(client);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      company: client.company || "",
      notes: client.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.email) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, company: form.company || null, notes: form.notes || null };

    if (editing) {
      const { error } = await supabase.from("clients").update(payload).eq("id", editing.id);
      if (!error) {
        setClients((prev) =>
          prev.map((c) => c.id === editing.id ? { ...c, ...payload } : c)
        );
        toast({ title: "تم تعديل بيانات العميل" });
      }
    } else {
      const { data, error } = await supabase.from("clients").insert(payload).select().single();
      if (!error && data) {
        setClients((prev) => [{ ...data, total_projects: 0, active_projects: 0, total_revenue: 0 }, ...prev]);
        toast({ title: "تم إضافة العميل بنجاح" });
      }
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ", description: "لا يمكن حذف عميل له مشاريع", variant: "destructive" });
    } else {
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "تم حذف العميل" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">العملاء</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة قاعدة بيانات العملاء ({clients.length} عميل)</p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 gap-2 rounded-xl shadow-sm">
          <Plus className="w-4 h-4" /> عميل جديد
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="بحث في العملاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 rounded-xl"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>لا يوجد عملاء يطابقون البحث</p>
          </div>
        ) : (
          filtered.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">{client.name}</p>
                    {client.company && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" /> {client.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(client)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(client.id, client.name)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="num">{client.phone}</span>
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {client.email}
                </p>
              </div>

              {client.notes && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 border-t border-slate-50 pt-3">{client.notes}</p>
              )}

              <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-3">
                <div className="text-center">
                  <p className="text-base font-bold text-slate-700 num">{client.total_projects}</p>
                  <p className="text-xs text-slate-400">مشاريع</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-blue-600 num">{client.active_projects}</p>
                  <p className="text-xs text-slate-400">نشطة</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-emerald-600 num">{(client.total_revenue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-slate-400">إيرادات</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={(o) => { setShowModal(o); }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">اسم العميل *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-medium">رقم الهاتف *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0123456789" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">البريد الإلكتروني *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">الشركة</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="اسم الشركة (اختياري)" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">ملاحظات</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات إضافية..." rows={2} className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editing ? "حفظ التعديلات" : "إضافة العميل"}
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
