import { createClient } from "@/lib/supabase/server";
import { TeamClient } from "@/components/team/TeamClient";

export default async function TeamPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false });

  return <TeamClient members={members || []} />;
}
