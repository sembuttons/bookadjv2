import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const [pendingBookings, pendingVerifications, flaggedMessages] =
    await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseAdmin
        .from("dj_profiles")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "pending"),
      supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_flagged", true),
    ]);

  return NextResponse.json({
    pendingBookings: pendingBookings.count ?? 0,
    pendingVerifications: pendingVerifications.count ?? 0,
    flaggedMessages: flaggedMessages.count ?? 0,
  });
}
