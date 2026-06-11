import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*, project:projects(id, name, status)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, unread: data?.filter((n) => !n.is_read).length || 0 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { ids, mark_all } = body;

  if (mark_all) {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  } else if (ids?.length) {
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
  }
  return NextResponse.json({ success: true });
}
