"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string; project_id: string; type: string;
  message: string; is_read: boolean; created_at: string;
  project?: { id: string; name: string; status: string };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*, project:projects(id, name, status)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setNotifications(data as NotificationItem[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Realtime subscription
    const channel = supabase
      .channel("notifications-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: load };
}
