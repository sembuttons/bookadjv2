import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFrom =
  process.env.RESEND_FROM_EMAIL || "bookadj <onboarding@resend.dev>";
const inbox = process.env.CONTACT_INBOX_EMAIL?.trim() || "hallo@bookadj.nl";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "E-mail is tijdelijk niet beschikbaar. Mail direct naar hallo@bookadj.nl." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const honeypot =
    typeof body._gotcha === "string" ? body._gotcha.trim() : "";
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email =
    typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 8000) : "";

  if (!name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Vul een geldige naam en e-mailadres in." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Bericht is te kort (minimaal 10 tekens)." },
      { status: 400 },
    );
  }

  const nameSafe = escapeHtml(name);
  const emailSafe = escapeHtml(email);
  const msgSafe = escapeHtml(message).replace(/\n/g, "<br/>");

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: defaultFrom,
      to: inbox,
      replyTo: email,
      subject: `[bookadj support] ${name}`,
      html: `<p><strong>Naam:</strong> ${nameSafe}</p><p><strong>E-mail:</strong> ${emailSafe}</p><hr/><p>${msgSafe}</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "E-mail kon niet worden verstuurd.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
