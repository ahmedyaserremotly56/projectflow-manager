import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", session.user.id).single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: allProfiles } = await supabase
    .from("profiles").select("id, full_name, email, role, created_at").order("created_at");

  return <SettingsClient currentUser={profile} users={allProfiles || []} />;
}
