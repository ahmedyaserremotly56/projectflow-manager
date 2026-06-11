"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Settings, Users, Shield, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ROLE_CONFIG, getInitials, formatDate } from "@/lib/utils";

interface Profile {
  id: string; full_name: string; email: string; role: string; created_at: string;
}

interface SettingsClientProps {
  currentUser: Profile;
  users: Profile[];
}

export function SettingsClient({ currentUser, users: initialUsers }: SettingsClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const updateRole = async (userId: string, newRole: string) => {
    if (userId === currentUser.id) {
      toast({ title: "تنبيه", description: "لا يمكنك تغيير صلاحيتك الخاصة", variant: "destructive" });
      return;
    }
    setSaving(userId);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (!error) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: "تم تحديث الصلاحية بنجاح" });
    } else {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" /> الإعدادات
        </h1>
        <p className="text-slate-500 text-sm mt-1">إدارة المستخدمين والصلاحيات</p>
      </div>

      {/* Roles overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { role: "admin", label: "مدير النظام", desc: "جميع الصلاحيات - الوصول الكامل", icon: "👑", count: users.filter(u => u.role === "admin").length },
          { role: "manager", label: "مدير مشاريع", desc: "إدارة المشاريع والعملاء والفريق", icon: "🧑‍💼", count: users.filter(u => u.role === "manager").length },
          { role: "member", label: "عضو فريق", desc: "عرض المشاريع والمهام المكلف بها فقط", icon: "👷", count: users.filter(u => u.role === "member").length },
        ].map((r) => (
          <div key={r.role} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{r.icon}</span>
              <span className="text-2xl font-bold text-slate-700 num">{r.count}</span>
            </div>
            <p className="text-sm font-bold text-slate-700">{r.label}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-bold text-slate-700">إدارة المستخدمين</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{users.length} مستخدم</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-sm">المستخدم</th>
                <th className="px-5 py-3 text-sm">البريد الإلكتروني</th>
                <th className="px-5 py-3 text-sm">تاريخ الإنشاء</th>
                <th className="px-5 py-3 text-sm">الصلاحية</th>
                <th className="px-5 py-3 text-sm">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => {
                const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG];
                const isCurrent = user.id === currentUser.id;
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/60 transition-colors ${isCurrent ? "bg-blue-50/30" : ""}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {user.full_name}
                            {isCurrent && <span className="text-xs text-blue-500 mr-2">(أنت)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{user.email}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 num">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`status-badge ${roleConf?.bgColor} ${roleConf?.color}`}>
                        <Shield className="w-3 h-3" />
                        {roleConf?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isCurrent ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={user.role}
                            onValueChange={(v) => updateRole(user.id, v)}
                            disabled={saving === user.id}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">مدير النظام</SelectItem>
                              <SelectItem value="manager">مدير مشاريع</SelectItem>
                              <SelectItem value="member">عضو فريق</SelectItem>
                            </SelectContent>
                          </Select>
                          {saving === user.id && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions matrix */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" /> مصفوفة الصلاحيات
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-right text-sm font-semibold text-slate-600">الصلاحية</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-purple-600">Admin</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-blue-600">Manager</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-slate-600">Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                ["عرض لوحة التحكم", true, true, true],
                ["إدارة المشاريع (إضافة/تعديل)", true, true, false],
                ["حذف المشاريع", true, false, false],
                ["عرض المشاريع المكلف بها", true, true, true],
                ["إدارة العملاء", true, true, false],
                ["إدارة الفريق", true, true, false],
                ["إضافة وتعديل المهام", true, true, false],
                ["عرض المهام المكلف بها", true, true, true],
                ["عرض التقارير", true, true, false],
                ["تصدير التقارير", true, true, false],
                ["إدارة الصلاحيات", true, false, false],
              ].map(([perm, admin, manager, member]) => (
                <tr key={String(perm)} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-sm text-slate-700">{String(perm)}</td>
                  {[admin, manager, member].map((val, i) => (
                    <td key={i} className="px-5 py-3 text-center">
                      {val ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full">
                          <span className="text-slate-300 text-xs font-bold">✕</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
