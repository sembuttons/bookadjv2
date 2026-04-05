import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireUser } from "@/lib/api-auth";
import {
  analyzeMessageContent,
  warningForPriorOffenses,
} from "@/lib/messages-safety";
import { supabaseAdmin } from "@/lib/supabase-server";

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFrom =
  process.env.RESEND_FROM_EMAIL || "bookadj <onboarding@resend.dev>";
const adminEmail = process.env.ADMIN_ALERT_EMAIL || "admin@bookadj.nl";

function appBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "";
  if (!raw) return "https://bookadj.nl";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if (auth.response) return auth.response;
  const sessionUser = auth.user;

  let body: {
    content?: string;
    sender_id?: string;
    recipient_id?: string;
    inbox_type?: string;
    booking_id?: string | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  const sender_id = body.sender_id;
  const recipient_id = body.recipient_id;
  if (!content.trim() || !sender_id || !recipient_id) {
    return NextResponse.json(
      { error: "Verplichte velden ontbreken" },
      { status: 400 },
    );
  }

  if (sender_id !== sessionUser.id) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  if (sender_id === recipient_id) {
    return NextResponse.json(
      { error: "Ongeldige ontvanger." },
      { status: 400 },
    );
  }

  const { data: sender, error: senderErr } = await supabaseAdmin
    .from("users")
    .select("is_suspended, offense_count, full_name, email")
    .eq("id", sender_id)
    .maybeSingle();

  if (senderErr) {
    return NextResponse.json({ error: senderErr.message }, { status: 500 });
  }

  const senderRow = sender as {
    is_suspended?: boolean | null;
    offense_count?: number | null;
    full_name?: string | null;
    email?: string | null;
  } | null;

  if (senderRow?.is_suspended) {
    return NextResponse.json({ error: "Account opgeschort" }, { status: 403 });
  }

  const priorOffenses = senderRow?.offense_count ?? 0;
  const { isFlagged, flagReason, displayContent } =
    analyzeMessageContent(content);

  const insertPayload: Record<string, unknown> = {
    content: displayContent,
    sender_id,
    recipient_id,
    inbox_type: body.inbox_type?.trim() || "ask_me",
    booking_id: body.booking_id ?? null,
    is_flagged: isFlagged,
    flag_reason: flagReason,
    is_read: false,
  };

  const { data: message, error: insertErr } = await supabaseAdmin
    .from("messages")
    .insert(insertPayload)
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  let newOffenseCount = priorOffenses;

  if (isFlagged) {
    newOffenseCount = priorOffenses + 1;
    await supabaseAdmin
      .from("users")
      .update({ offense_count: newOffenseCount })
      .eq("id", sender_id);

    try {
      await supabaseAdmin.from("audit_log").insert({
        admin_id: null,
        action: "message_flagged",
        target_type: "message",
        target_id: (message as { id: string }).id,
        reason: flagReason ?? "automatisch gedetecteerd",
        metadata: { sender_id, automated: true },
      });
    } catch {
      /* audit_log optioneel */
    }

    if (newOffenseCount >= 3 && resendApiKey) {
      await supabaseAdmin
        .from("users")
        .update({ is_suspended: true })
        .eq("id", sender_id);
      const resend = new Resend(resendApiKey);
      try {
        await resend.emails.send({
          from: defaultFrom,
          to: adminEmail,
          subject: "Account automatisch opgeschort",
          html: `<p>Gebruiker ${senderRow?.full_name ?? ""} (${senderRow?.email ?? ""}) is automatisch opgeschort na ${newOffenseCount} overtredingen. Laatste overtreding: ${flagReason ?? ""}</p>`,
        });
      } catch {
        /* e-mailfout negeren */
      }
    } else if (newOffenseCount >= 2 && resendApiKey) {
      const resend = new Resend(resendApiKey);
      try {
        await resend.emails.send({
          from: defaultFrom,
          to: adminEmail,
          subject: "Tweede bericht-melding",
          html: `<p>Gebruiker ${senderRow?.full_name ?? ""} (${senderRow?.email ?? ""}) heeft ${newOffenseCount} meldingen. Reden: ${flagReason ?? ""}</p><p>Voorbeeld: ${escapeHtml(content.slice(0, 200))}</p>`,
        });
      } catch {
        /* negeren */
      }
    }
  }

  if (!isFlagged && resendApiKey) {
    const fifteenMinutesAgo = new Date(
      Date.now() - 15 * 60 * 1000,
    ).toISOString();
    const { data: recentRows } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("type", "new_message")
      .eq("user_id", recipient_id)
      .gte("sent_at", fifteenMinutesAgo)
      .limit(1);

    const recentList = recentRows as { id: string }[] | null;
    if (!recentList?.length) {
      const { data: recipient } = await supabaseAdmin
        .from("users")
        .select("email, full_name")
        .eq("id", recipient_id)
        .maybeSingle();

      const rec = recipient as {
        email?: string | null;
        full_name?: string | null;
      } | null;

      if (rec?.email) {
        const resend = new Resend(resendApiKey);
        const base = appBaseUrl();
        try {
          await resend.emails.send({
            from: defaultFrom,
            to: rec.email,
            subject: "Nieuw bericht op bookadj",
            html: `<h2>Je hebt een nieuw bericht</h2><p>${escapeHtml(senderRow?.full_name ?? "Iemand")} heeft je een bericht gestuurd op bookadj.</p><p><a href="${base}/berichten">Bekijk berichten</a></p>`,
          });
        } catch {
          /* negeren */
        }

        try {
          await supabaseAdmin.from("notifications").insert({
            user_id: recipient_id,
            type: "new_message",
            channel: "email",
            payload: { senderId: sender_id, messageId: (message as { id: string }).id },
            sent_at: new Date().toISOString(),
          });
        } catch {
          /* notifications optioneel */
        }
      }
    }
  }

  return NextResponse.json({
    message,
    isFlagged,
    flagReason,
    offenseCount: isFlagged ? newOffenseCount : 0,
    warning: isFlagged ? warningForPriorOffenses(priorOffenses) : null,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
