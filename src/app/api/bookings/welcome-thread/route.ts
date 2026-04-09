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

  const [{ data: profile, error: profErr }, { data: customerRow }] =
    await Promise.all([
      supabaseAdmin
        .from("dj_profiles")
        .select("user_id, stage_name, display_name, full_name")
        .eq("id", row.dj_id)
        .maybeSingle(),
      supabaseAdmin
        .from("users")
        .select("full_name, email")
        .eq("id", row.customer_id)
        .maybeSingle(),
    ]);

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

  const cu = customerRow as
    | { full_name?: string | null; email?: string | null }
    | null;
  const customerName =
    (typeof cu?.full_name === "string" && cu.full_name.trim()) ||
    (typeof cu?.email === "string" && cu.email.split("@")[0]?.trim()) ||
    "Klant";

  /** Neutral copy so both klant and DJ zien wie de boeker is (geen alleen-“je”-tekst). */
  const content = `${customerName} heeft een boeking geplaatst. Chat hier verder met ${djName}.`;

  const { data: existingThread } = await supabaseAdmin
    .from("messages")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("sender_id", row.customer_id)
    .eq("recipient_id", djAuthId)
    .eq("inbox_type", "book_me")
    .limit(1);

  if (existingThread && existingThread.length > 0) {
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
