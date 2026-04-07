import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  bookingConfirmedEmail,
  bookingReceivedEmail,
  bookingRejectedEmail,
} from "@/lib/email-templates";
import { getContactInboxEmail, getResendFromEmail } from "@/lib/resend-from";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFrom = getResendFromEmail();
const contactInbox = getContactInboxEmail();

const CONTACT_SUBJECTS = [
  "Boeking",
  "Betaling",
  "Technisch probleem",
  "Anders",
] as const;

const NOTIFICATION_TYPES = [
  "booking_requested",
  "booking_confirmed",
  "booking_declined",
] as const;

type NotificationType = (typeof NOTIFICATION_TYPES)[number];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function embedOne<T extends Record<string, unknown>>(
  v: T | T[] | null | undefined,
): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function formatEuroFromCents(cents: number | null | undefined): string {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "-";
  const euros = cents / 100;
  return euros.toLocaleString("nl-NL", {
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleContactForm(
  raw: Record<string, unknown>,
  resend: Resend,
): Promise<NextResponse> {
  const honeypot =
    typeof raw._gotcha === "string" ? raw._gotcha.trim() : "";
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  const name =
    typeof raw.name === "string" ? raw.name.trim().slice(0, 120) : "";
  const email =
    typeof raw.email === "string" ? raw.email.trim().slice(0, 254) : "";
  const onderwerp =
    typeof raw.onderwerp === "string" ? raw.onderwerp.trim() : "";
  const bericht =
    typeof raw.bericht === "string" ? raw.bericht.trim().slice(0, 8000) : "";

  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Vul een geldige naam en e-mailadres in." },
      { status: 400 },
    );
  }
  if (!CONTACT_SUBJECTS.includes(onderwerp as (typeof CONTACT_SUBJECTS)[number])) {
    return NextResponse.json({ error: "Ongeldig onderwerp." }, { status: 400 });
  }
  if (bericht.length < 10) {
    return NextResponse.json(
      { error: "Bericht is te kort (minimaal 10 tekens)." },
      { status: 400 },
    );
  }

  const nameSafe = escapeHtml(name);
  const emailSafe = escapeHtml(email);
  const subjSafe = escapeHtml(onderwerp);
  const bodySafe = escapeHtml(bericht).replace(/\n/g, "<br/>");

  try {
    await resend.emails.send({
      from: defaultFrom,
      to: contactInbox,
      replyTo: email,
      subject: `[bookadj contact] ${onderwerp} | ${name}`,
      html: `<p><strong>Naam:</strong> ${nameSafe}</p><p><strong>E-mail:</strong> ${emailSafe}</p><p><strong>Onderwerp:</strong> ${subjSafe}</p><p>${bodySafe}</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "E-mail kon niet worden verstuurd.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY ontbreekt." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  if (body.type === "contact_form") {
    const resend = new Resend(resendApiKey);
    return handleContactForm(body, resend);
  }

  const authHeader = req.headers.get("authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { data: userData, error: authError } =
    await supabaseAdmin.auth.getUser(token);
  if (authError || !userData.user) {
    return NextResponse.json({ error: "Ongeldige sessie." }, { status: 401 });
  }

  const uid = userData.user.id;

  const type = body.type as NotificationType;
  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId : "";
  if (!bookingId || !NOTIFICATION_TYPES.includes(type as NotificationType)) {
    return NextResponse.json(
      { error: "type of bookingId ontbreekt of is ongeldig." },
      { status: 400 },
    );
  }

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, customer_id, dj_id, reference, event_date, hours, venue_address, total_amount, users!bookings_customer_id_fkey(email, full_name), dj_profiles(stage_name, city, user_id)",
    )
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: "Boeking niet gevonden." },
      { status: 404 },
    );
  }

  const row = booking as {
    customer_id?: string | null;
    user_id?: string | null;
    dj_id?: string | null;
    reference?: string | null;
    event_date?: string | null;
    hours?: number | null;
    venue_address?: string | null;
    total_amount?: number | null;
    users?: { email?: string | null; full_name?: string | null } | unknown;
    dj_profiles?: {
      stage_name?: string | null;
      city?: string | null;
      user_id?: string | null;
    } | unknown;
  };

  if (type === "booking_requested") {
    const owner =
      (typeof row.customer_id === "string" && row.customer_id === uid) ||
      (typeof row.user_id === "string" && row.user_id === uid);
    if (!owner) {
      return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
    }
  } else {
    const djId = typeof row.dj_id === "string" ? row.dj_id : null;
    if (!djId) {
      return NextResponse.json({ error: "Ongeldige boeking." }, { status: 400 });
    }
    const { data: djProfile, error: djErr } = await supabaseAdmin
      .from("dj_profiles")
      .select("user_id")
      .eq("id", djId)
      .single();
    if (djErr || !djProfile || (djProfile as { user_id?: string }).user_id !== uid) {
      return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
    }
  }

  const customer = embedOne(
    row.users as { email?: string | null; full_name?: string | null } | null,
  );

  const dj = embedOne(
    row.dj_profiles as {
      stage_name?: string | null;
      city?: string | null;
      user_id?: string | null;
    } | null,
  );
  const stageName =
    typeof dj?.stage_name === "string" && dj.stage_name.trim()
      ? dj.stage_name.trim()
      : "DJ";
  const eventDateRaw = typeof row.event_date === "string" ? row.event_date : "-";
  const totalEuro = formatEuroFromCents(row.total_amount ?? null);
  const venue = typeof row.venue_address === "string" && row.venue_address.trim()
    ? row.venue_address.trim()
    : "-";
  const hours = typeof row.hours === "number" ? row.hours : "-";

  const resend = new Resend(resendApiKey);

  try {
    if (type === "booking_requested") {
      const djAuthId = typeof dj?.user_id === "string" ? dj.user_id.trim() : "";
      if (!djAuthId) {
        return NextResponse.json({ error: "DJ-account ontbreekt." }, { status: 400 });
      }
      const { data: djUser } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", djAuthId)
        .maybeSingle();
      const djEmail = (djUser as { email?: string | null } | null)?.email?.trim() || "";
      if (!djEmail) {
        return NextResponse.json({ error: "Geen e-mailadres voor DJ." }, { status: 400 });
      }
      await resend.emails.send({
        from: defaultFrom,
        to: djEmail,
        subject: `Nieuwe boekingsaanvraag | ${eventDateRaw}`,
        html: bookingReceivedEmail({
          date: eventDateRaw,
          location: venue,
          hours,
          totalAmountEuro: totalEuro,
        }),
      });
    } else if (type === "booking_confirmed") {
      const toEmail =
        typeof customer?.email === "string" ? customer.email.trim() : "";
      if (!toEmail) {
        return NextResponse.json({ error: "Geen e-mailadres voor klant." }, { status: 400 });
      }
      await resend.emails.send({
        from: defaultFrom,
        to: toEmail,
        subject: `Je boeking is bevestigd! | ${stageName}`,
        html: bookingConfirmedEmail({
          djName: stageName,
          date: eventDateRaw,
          location: venue,
          totalAmountEuro: totalEuro,
        }),
      });
    } else if (type === "booking_declined") {
      const toEmail =
        typeof customer?.email === "string" ? customer.email.trim() : "";
      if (!toEmail) {
        return NextResponse.json({ error: "Geen e-mailadres voor klant." }, { status: 400 });
      }
      await resend.emails.send({
        from: defaultFrom,
        to: toEmail,
        subject: "Update over je boekingsaanvraag",
        html: bookingRejectedEmail({ djName: stageName }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "E-mail kon niet worden verstuurd.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
