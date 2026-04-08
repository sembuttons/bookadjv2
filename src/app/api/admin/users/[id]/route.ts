import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const ROLES = new Set(["klant", "dj", "admin"]);

function normalizeRole(r: string): string | null {
  const x = r.trim().toLowerCase();
  if (x === "customer") return "klant";
  if (ROLES.has(x)) return x;
  return null;
}

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

  let body: { role?: string; is_suspended?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.role === "string") {
    const nr = normalizeRole(body.role);
    if (!nr) {
      return NextResponse.json({ error: "Ongeldige rol." }, { status: 400 });
    }
    patch.role = nr;
  }
  if (typeof body.is_suspended === "boolean") {
    patch.is_suspended = body.is_suspended;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Geen wijzigingen." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(patch)
    .eq("id", id)
    .select("id, role, is_suspended")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  await supabaseAdmin.from("audit_log").insert({
    admin_id: auth.user.id,
    action: "user_updated",
    target_type: "user",
    target_id: id,
    reason: JSON.stringify(patch),
    metadata: {},
  });

  return NextResponse.json({ ok: true, user: data });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Ontbrekend id." }, { status: 400 });
  }

  if (id === auth.user.id) {
    return NextResponse.json(
      { error: "Je kunt je eigen admin-account niet verwijderen." },
      { status: 400 },
    );
  }

  const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authDelErr) {
    return NextResponse.json(
      { error: authDelErr.message ?? "Auth verwijderen mislukt." },
      { status: 500 },
    );
  }

  await supabaseAdmin.from("users").delete().eq("id", id);

  await supabaseAdmin.from("audit_log").insert({
    admin_id: auth.user.id,
    action: "user_deleted",
    target_type: "user",
    target_id: id,
    reason: "Account verwijderd door admin",
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
