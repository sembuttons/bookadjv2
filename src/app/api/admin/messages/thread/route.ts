import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(req.url);
  const a = searchParams.get("a");
  const b = searchParams.get("b");
  if (!a || !b) {
    return NextResponse.json({ error: "Parameters ontbreken." }, { status: 400 });
  }

  const [{ data: ab }, { data: ba }] = await Promise.all([
    supabaseAdmin
      .from("messages")
      .select("*")
      .eq("sender_id", a)
      .eq("recipient_id", b)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("messages")
      .select("*")
      .eq("sender_id", b)
      .eq("recipient_id", a)
      .order("created_at", { ascending: true }),
  ]);

  const merged = [...(ab ?? []), ...(ba ?? [])].sort(
    (x, y) =>
      new Date((x as { created_at: string }).created_at).getTime() -
      new Date((y as { created_at: string }).created_at).getTime(),
  );

  const { data: userA } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email, offense_count, is_suspended")
    .eq("id", a)
    .maybeSingle();

  const { data: userB } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email, offense_count, is_suspended")
    .eq("id", b)
    .maybeSingle();

  return NextResponse.json({
    messages: merged,
    userA: userA ?? null,
    userB: userB ?? null,
  });
}
