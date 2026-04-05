import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Stripe is niet geconfigureerd (STRIPE_SECRET_KEY)." },
      { status: 500 },
    );
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

  let body: { bookingId?: string };
  try {
    body = (await req.json()) as { bookingId?: string };
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId ontbreekt." }, { status: 400 });
  }

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("*, dj_profiles(stripe_account_id)")
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
    status?: string | null;
    total_amount?: number | string | null;
  };

  const owner =
    (typeof row.customer_id === "string" && row.customer_id === uid) ||
    (typeof row.user_id === "string" && row.user_id === uid);
  if (!owner) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const status =
    typeof row.status === "string" ? row.status.toLowerCase() : "";
  if (status !== "pending") {
    return NextResponse.json(
      { error: "Deze boeking kan niet meer worden betaald." },
      { status: 400 },
    );
  }

  let amountCents: number;
  if (typeof row.total_amount === "number" && Number.isFinite(row.total_amount)) {
    amountCents = Math.round(row.total_amount);
  } else if (typeof row.total_amount === "string") {
    amountCents = Math.round(parseFloat(row.total_amount));
  } else {
    return NextResponse.json(
      { error: "Ongeldig boekingsbedrag." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return NextResponse.json(
      { error: "Bedrag is te laag voor betaling." },
      { status: 400 },
    );
  }

  try {
    const stripe = new Stripe(stripeSecret);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId },
    });

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "Geen client secret ontvangen van Stripe." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Stripe-fout bij aanmaken betaling.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
