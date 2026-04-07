import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getResendFromEmail } from "@/lib/resend-from";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFrom = getResendFromEmail();

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  let body: { messageId?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const messageId = body.messageId;
  const action = body.action;
  if (!messageId || !action) {
    return NextResponse.json({ error: "Ontbrekende velden." }, { status: 400 });
  }

  const { data: msg, error: msgErr } = await supabaseAdmin
    .from("messages")
    .select("id, sender_id, is_flagged")
    .eq("id", messageId)
    .maybeSingle();

  if (msgErr || !msg) {
    return NextResponse.json({ error: "Bericht niet gevonden." }, { status: 404 });
  }

  const row = msg as { id: string; sender_id: string; is_flagged?: boolean };
  const senderId = row.sender_id;

  if (action === "clear_flag") {
    const { error } = await supabaseAdmin
      .from("messages")
      .update({ is_flagged: false, flag_reason: null })
      .eq("id", messageId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await supabaseAdmin.from("audit_log").insert({
      admin_id: auth.user.id,
      action: "message_flag_cleared",
      target_type: "message",
      target_id: messageId,
      reason: "Geen actie (admin)",
      metadata: {},
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "warn_user") {
    const { data: sender } = await supabaseAdmin
      .from("users")
      .select("offense_count, email, full_name")
      .eq("id", senderId)
      .maybeSingle();

    const s = sender as {
      offense_count?: number | null;
      email?: string | null;
      full_name?: string | null;
    } | null;

    const next = (s?.offense_count ?? 0) + 1;
    await supabaseAdmin
      .from("users")
      .update({ offense_count: next })
      .eq("id", senderId);

    await supabaseAdmin.from("audit_log").insert({
      admin_id: auth.user.id,
      action: "user_warned_message",
      target_type: "user",
      target_id: senderId,
      reason: "Waarschuwing na gemarkeerd bericht",
      metadata: { messageId },
    });

    if (resendApiKey && s?.email) {
      const resend = new Resend(resendApiKey);
      try {
        await resend.emails.send({
          from: defaultFrom,
          to: s.email,
          subject: "Waarschuwing van bookadj",
          html: `<p>Beste ${escapeHtml(s.full_name ?? "")},</p><p>Je hebt een waarschuwing ontvangen vanwege de inhoud van een bericht op bookadj. Houd je aan de communityrichtlijnen.</p>`,
        });
      } catch {
        /* negeren */
      }
    }

    return NextResponse.json({ ok: true, offense_count: next });
  }

  if (action === "suspend_user") {
    await supabaseAdmin
      .from("users")
      .update({ is_suspended: true })
      .eq("id", senderId);

    await supabaseAdmin.from("audit_log").insert({
      admin_id: auth.user.id,
      action: "user_suspended_message",
      target_type: "user",
      target_id: senderId,
      reason: "Geblokkeerd via admin berichten",
      metadata: { messageId },
    });

    const { data: sender } = await supabaseAdmin
      .from("users")
      .select("email, full_name")
      .eq("id", senderId)
      .maybeSingle();

    const s = sender as { email?: string | null; full_name?: string | null } | null;

    if (resendApiKey && s?.email) {
      const resend = new Resend(resendApiKey);
      try {
        await resend.emails.send({
          from: defaultFrom,
          to: s.email,
          subject: "Je bookadj-account is opgeschort",
          html: `<p>Beste ${escapeHtml(s.full_name ?? "")},</p><p>Je account is opgeschort. Neem contact op met support voor meer informatie.</p>`,
        });
      } catch {
        /* negeren */
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
