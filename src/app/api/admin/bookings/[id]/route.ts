import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED = new Set(["cancelled", "completed", "confirmed", "pending", "paid"]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Ontbrekend id." }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const status = body.status?.toLowerCase().trim();
  if (!status || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "Ongeldige status." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Boeking niet gevonden." }, { status: 404 });
  }

  await supabaseAdmin.from("audit_log").insert({
    admin_id: auth.user.id,
    action: "booking_status_updated",
    target_type: "booking",
    target_id: id,
    reason: `status → ${status}`,
    metadata: {},
  });

  return NextResponse.json({ ok: true, booking: data });
}
