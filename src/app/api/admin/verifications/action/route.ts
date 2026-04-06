import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id) {
    return NextResponse.json({ error: "ID ontbreekt." }, { status: 400 });
  }

  if (action === "approve") {
    const { error } = await supabaseAdmin
      .from("dj_profiles")
      .update({ verification_status: "verified", is_visible: true })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("dj_profiles")
      .update({ verification_status: "rejected" })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
}

