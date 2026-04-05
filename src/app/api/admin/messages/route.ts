import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

type MsgRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content?: string | null;
  created_at?: string;
  is_flagged?: boolean | null;
  flag_reason?: string | null;
  inbox_type?: string | null;
};

type UserRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  offense_count?: number | null;
  is_suspended?: boolean | null;
};

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") === "flagged" ? "flagged" : "all";

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count: flaggedToday } = await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("is_flagged", true)
    .gte("created_at", startOfDay.toISOString());

  const { count: messagesToday } = await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfDay.toISOString());

  const { count: suspendedUsers } = await supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("is_suspended", true);

  let q = supabaseAdmin.from("messages").select("*");
  if (tab === "flagged") {
    q = q.eq("is_flagged", true);
  }
  const { data: rawMessages, error } = await q
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (rawMessages ?? []) as MsgRow[];
  const ids = new Set<string>();
  for (const m of rows) {
    ids.add(m.sender_id);
    ids.add(m.recipient_id);
  }

  let userMap: Record<string, UserRow> = {};
  if (ids.size > 0) {
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, offense_count, is_suspended")
      .in("id", [...ids]);
    userMap = Object.fromEntries(
      ((users ?? []) as UserRow[]).map((u) => [u.id, u]),
    );
  }

  const messages = rows.map((m) => ({
    ...m,
    sender: userMap[m.sender_id] ?? null,
    recipient: userMap[m.recipient_id] ?? null,
  }));

  return NextResponse.json({
    messages,
    stats: {
      flaggedToday: flaggedToday ?? 0,
      messagesToday: messagesToday ?? 0,
      suspendedUsers: suspendedUsers ?? 0,
    },
    tab,
  });
}
