import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Public: resolves a DJ profile id to the auth user id for messaging.
 * Only returns user id for visible, verified profiles.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await params;
  const id = raw?.trim();
  if (!id) {
    return NextResponse.json({ error: "Ongeldig id" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      { error: "Serverconfiguratie ontbreekt." },
      { status: 503 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("dj_profiles")
    .select("user_id, is_visible, verification_status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as {
    user_id?: string | null;
    is_visible?: boolean | null;
    verification_status?: string | null;
  } | null;

  const userId =
    typeof row?.user_id === "string" && row.user_id.trim()
      ? row.user_id.trim()
      : "";

  if (!userId) {
    return NextResponse.json(
      { error: "Geen gebruiker gekoppeld aan dit profiel." },
      { status: 404 },
    );
  }

  const visible = row?.is_visible === true;
  const verified = row?.verification_status === "verified";
  if (!visible || !verified) {
    return NextResponse.json(
      { error: "Dit profiel is niet beschikbaar voor berichten." },
      { status: 404 },
    );
  }

  return NextResponse.json({ userId });
}
