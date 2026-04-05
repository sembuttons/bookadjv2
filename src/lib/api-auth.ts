import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function getBearerUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return { user: null as User | null, error: "Geen token" };
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return { user: null as User | null, error: "Ongeldige sessie" };
  }
  return { user: data.user, error: null as null };
}

export async function requireUser(req: Request): Promise<
  | { user: User; response: null }
  | { user: null; response: NextResponse }
> {
  const { user, error } = await getBearerUser(req);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: error ?? "Niet ingelogd." },
        { status: 401 },
      ),
    };
  }
  return { user, response: null };
}

export async function requireAdmin(req: Request): Promise<
  | { user: User; response: null }
  | { user: null; response: NextResponse }
> {
  const r = await requireUser(req);
  if (r.response) return r;
  const { data: row, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", r.user.id)
    .maybeSingle();
  if (error || (row as { role?: string } | null)?.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json({ error: "Geen toegang." }, { status: 403 }),
    };
  }
  return { user: r.user, response: null };
}
