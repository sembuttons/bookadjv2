import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if (auth.response) return auth.response;

  let body: { content?: string; recipient_id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Ongeldige body." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const recipientId =
    typeof body.recipient_id === "string" ? body.recipient_id.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Schrijf eerst een bericht." }, { status: 400 });
  }

  if (!recipientId) {
    return NextResponse.json({ error: "Ontvanger ontbreekt." }, { status: 400 });
  }

  if (recipientId === auth.user.id) {
    return NextResponse.json({ error: "Je kunt geen bericht aan jezelf sturen." }, { status: 400 });
  }

  const token =
    req.headers.get("authorization")?.replace(/^Bearer\\s+/i, "").trim() || "";
  if (!token) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const { error } = await supabase.from("messages").insert({
    sender_id: auth.user.id,
    recipient_id: recipientId,
    content,
    created_at: new Date().toISOString(),
    is_read: false,
  });

  if (error) {
    console.error("Message insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
