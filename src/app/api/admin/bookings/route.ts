import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

type Customer = {
  id?: string;
  full_name?: string | null;
  email?: string | null;
};

type DjProfile = {
  stage_name?: string | null;
  hourly_rate?: number | null;
  user_id?: string | null;
};

type BookingRow = Record<string, unknown> & {
  id: string;
  customer_id?: string;
  dj_id?: string;
  customer?: Customer | Customer[] | null;
  dj_profile?: DjProfile | DjProfile[] | null;
};

function one<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

async function enrichBookings(rows: BookingRow[]) {
  const djUserIds = new Set<string>();
  for (const b of rows) {
    const dp = one(b.dj_profile);
    const uid =
      typeof dp?.user_id === "string" && dp.user_id.trim()
        ? dp.user_id.trim()
        : "";
    if (uid) djUserIds.add(uid);
  }

  let djUsers: Record<string, { full_name?: string | null; email?: string | null }> =
    {};
  if (djUserIds.size > 0) {
    const { data: du } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email")
      .in("id", [...djUserIds]);
    djUsers = Object.fromEntries(
      ((du ?? []) as { id: string; full_name?: string | null; email?: string | null }[]).map(
        (u) => [u.id, u],
      ),
    );
  }

  return rows.map((b) => {
    const dp = one(b.dj_profile);
    const djUid =
      typeof dp?.user_id === "string" && dp.user_id.trim()
        ? dp.user_id.trim()
        : "";
    return {
      ...b,
      dj_profile: dp,
      customer: one(b.customer),
      dj_user: djUid ? djUsers[djUid] ?? null : null,
    };
  });
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  const embedded = await supabaseAdmin
    .from("bookings")
    .select(
      `
      *,
      customer:users!bookings_customer_id_fkey(id, full_name, email),
      dj_profile:dj_profiles!bookings_dj_id_fkey(stage_name, hourly_rate, user_id)
    `,
    )
    .order("created_at", { ascending: false });

  if (!embedded.error && embedded.data) {
    const enriched = await enrichBookings((embedded.data ?? []) as BookingRow[]);
    return NextResponse.json({ bookings: enriched });
  }

  const plain = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (plain.error) {
    return NextResponse.json(
      { error: plain.error.message },
      { status: 500 },
    );
  }

  const base = (plain.data ?? []) as Record<string, unknown>[];
  const custIds = new Set<string>();
  const djProfIds = new Set<string>();
  for (const b of base) {
    const cid = typeof b.customer_id === "string" ? b.customer_id : "";
    const did = typeof b.dj_id === "string" ? b.dj_id : "";
    if (cid) custIds.add(cid);
    if (did) djProfIds.add(did);
  }

  type UserMini = {
    id: string;
    full_name?: string | null;
    email?: string | null;
  };

  let custMap: Record<string, Customer> = {};
  if (custIds.size > 0) {
    const { data: cu } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email")
      .in("id", [...custIds]);
    custMap = Object.fromEntries(
      ((cu ?? []) as UserMini[]).map((u) => [u.id, u as Customer]),
    );
  }

  type DjProfRow = DjProfile & { id: string };

  let djProfMap: Record<string, DjProfile> = {};
  if (djProfIds.size > 0) {
    const { data: dp } = await supabaseAdmin
      .from("dj_profiles")
      .select("id, stage_name, hourly_rate, user_id")
      .in("id", [...djProfIds]);
    djProfMap = Object.fromEntries(
      ((dp ?? []) as DjProfRow[]).map((p) => [p.id, p]),
    );
  }

  const rows: BookingRow[] = base.map((b) => {
    const id = String(b.id ?? "");
    const customer_id =
      typeof b.customer_id === "string" ? b.customer_id : "";
    const dj_id = typeof b.dj_id === "string" ? b.dj_id : "";
    return {
      ...(b as Record<string, unknown>),
      id,
      customer_id,
      dj_id,
      customer: customer_id ? custMap[customer_id] ?? null : null,
      dj_profile: dj_id ? djProfMap[dj_id] ?? null : null,
    } as BookingRow;
  });

  const enriched = await enrichBookings(rows);
  return NextResponse.json({ bookings: enriched });
}
