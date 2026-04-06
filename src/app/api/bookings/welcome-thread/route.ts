import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * After a customer creates a booking, inserts the first in-app thread message
 * (customer → DJ, boekings-inbox) so they can chat immediately.
 */
export async function POST(req: Request) {
  const auth = await requireUser(req);
  if (auth.response) return auth.response;

  let body: { bookingId?: string };
  try {
    body = (await req.json()) as { bookingId?: string };
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId.trim() : "";
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId ontbreekt." }, { status: 400 });
  }

  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from("bookings")
    .select("id, customer_id, dj_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingErr || !booking) {
    return NextResponse.json(
      { error: "Boeking niet gevonden." },
      { status: 404 },
    );
  }

  const row = booking as {
    id: string;
    customer_id: string;
    dj_id: string;
  };

  if (row.customer_id !== auth.user.id) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("dj_profiles")
    .select("user_id, stage_name, display_name, full_name")
    .eq("id", row.dj_id)
    .maybeSingle();

  if (profErr || !profile) {
    return NextResponse.json(
      { error: "DJ-profiel niet gevonden." },
      { status: 404 },
    );
  }

  const p = profile as {
    user_id?: string | null;
    stage_name?: string | null;
    display_name?: string | null;
    full_name?: string | null;
  };

  const djAuthId =
    typeof p.user_id === "string" && p.user_id.trim() ? p.user_id.trim() : "";
  if (!djAuthId) {
    return NextResponse.json(
      { error: "DJ-account ontbreekt voor berichten." },
      { status: 422 },
    );
  }

  const djName =
    (typeof p.stage_name === "string" && p.stage_name.trim()) ||
    (typeof p.display_name === "string" && p.display_name.trim()) ||
    (typeof p.full_name === "string" && p.full_name.trim()) ||
    "de DJ";

  const content = `Je boeking is verzonden! Je kunt hier direct met ${djName} chatten.`;

  const { data: existingRows } = await supabaseAdmin
    .from("messages")
    .select("id, content")
    .eq("booking_id", bookingId)
    .eq("sender_id", auth.user.id)
    .eq("recipient_id", djAuthId)
    .limit(25);

  const alreadyWelcome = (existingRows ?? []).some((r: { content?: string }) =>
    (r.content ?? "").startsWith("Je boeking is verzonden!"),
  );

  if (alreadyWelcome) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { error: insErr } = await supabaseAdmin.from("messages").insert({
    content,
    sender_id: auth.user.id,
    recipient_id: djAuthId,
    booking_id: bookingId,
    inbox_type: "book_me",
    is_read: false,
    is_flagged: false,
    flag_reason: null,
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
