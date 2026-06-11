"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Clock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Notification {
  id: string;
  project_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  project?: { id: string; name: string; status: string };
}

interface NotificationsClientProps {
  notifications: Notification[];
}

const typeConfig = {
  deadline_approaching: {
    icon: Clock,
    bg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
    label: "اقتراب الموعد",
  },
  deadline_passed: {
    icon: AlertCircle,
    bg: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    badge: "bg-red-100 text-red-700",
    label: "تجاوز الموعد",
  },
  project_completed: {
    icon: CheckCircle2,
    bg: "bg-green-50 border-green-200",
    iconColor: "text-green-500",
    badge: "bg-green-100 text-green-700",
    label: "مشروع مكتمل",
  },
};

export function NotificationsClient({ notifications: initial }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initial);
  const { toast } = useToast();
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast({ title: "تم تعليم جميع الإشعارات كمقروءة" });
  };

  const formatTime = (dateStr: string) => {
    return new Intl.RelativeTimeFormat("ar", { numeric: "auto" }).format(
      Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الإشعارات</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead} className="gap-2 rounded-xl">
            <EyeOff className="w-4 h-4" />
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 shadow-sm text-center">
          <Bell className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">لا توجد إشعارات</p>
          <p className="text-sm text-slate-300 mt-1">ستظهر هنا إشعارات المشاريع والمواعيد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const conf = typeConfig[n.type as keyof typeof typeConfig] || typeConfig.deadline_approaching;
            const Icon = conf.icon;
            return (
              <div
                key={n.id}
                className={`relative bg-white rounded-2xl p-4 border shadow-sm transition-all ${
                  !n.is_read ? "border-blue-200 shadow-blue-50/50" : "border-slate-100"
                }`}
              >
                {!n.is_read && (
                  <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${conf.bg}`}>
                    <Icon className={`w-5 h-5 ${conf.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conf.badge}`}>
                          {conf.label}
                        </span>
                        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{n.message}</p>
                        {n.project && (
                          <Link
                            href={`/projects/${n.project.id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                          >
                            عرض المشروع ←
                          </Link>
                        )}
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-xs text-slate-400">
                          {new Date(n.created_at).toLocaleDateString("ar-EG")}
                        </p>
                        {!n.is_read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-blue-500 hover:text-blue-600 mt-1 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> مقروء
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
