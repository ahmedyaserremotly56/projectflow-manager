import { createClient } from "@/lib/supabase/server";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const supabase = await createClient();

  // Auto-generate notifications for approaching/passed deadlines
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, delivery_date, status")
    .not("status", "in", '("completed","cancelled")');

  const now = new Date();
  for (const p of projects || []) {
    const delivery = new Date(p.delivery_date);
    const diffDays = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Check if notification already exists
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("project_id", p.id)
        .eq("type", "deadline_passed")
        .single();
      
      if (!existing) {
        await supabase.from("notifications").insert({
          project_id: p.id,
          type: "deadline_passed",
          message: `مشروع "${p.name}" تجاوز موعد التسليم بـ ${Math.abs(diffDays)} يوم!`,
        });
      }
    } else if (diffDays <= 3) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("project_id", p.id)
        .eq("type", "deadline_approaching")
        .single();

      if (!existing) {
        await supabase.from("notifications").insert({
          project_id: p.id,
          type: "deadline_approaching",
          message: `موعد تسليم مشروع "${p.name}" بعد ${diffDays} ${diffDays === 1 ? "يوم" : "أيام"}`,
        });
      }
    }
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, project:projects(id, name, status)")
    .order("created_at", { ascending: false });

  return <NotificationsClient notifications={notifications || []} />;
}
