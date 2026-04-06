import { normalizeUserUuid } from "@/lib/messaging-utils";
import { supabaseAdmin } from "@/lib/supabase-server";

export function normalizeMessageUserId(raw: string | null | undefined): string | null {
  return normalizeUserUuid(raw);
}

/**
 * Ensures `public.users` has a row for this auth user (required for suspended checks etc.).
 */
export async function ensurePublicUserRow(
  authUserId: string,
): Promise<{ ok: true } | { ok: false; nl: string }> {
  const { data: existing, error: selErr } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", authUserId)
    .maybeSingle();

  if (selErr) {
    return { ok: false, nl: "Kon gebruikersgegevens niet controleren. Probeer het later opnieuw." };
  }
  if (existing) return { ok: true };

  const { data: authRes, error: authErr } =
    await supabaseAdmin.auth.admin.getUserById(authUserId);

  if (authErr || !authRes?.user) {
    return { ok: false, nl: "Deze gebruiker bestaat niet of is niet gevonden." };
  }

  const u = authRes.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const roleRaw =
    typeof meta.role === "string" ? meta.role.trim().toLowerCase() : "";
  let role = "customer";
  if (roleRaw === "dj" || roleRaw === "admin") role = roleRaw;
  else if (roleRaw === "klant") role = "customer";

  const fullName =
    typeof meta.full_name === "string" && meta.full_name.trim()
      ? meta.full_name.trim()
      : null;

  const { error: upErr } = await supabaseAdmin.from("users").upsert(
    {
      id: u.id,
      email: u.email ?? "",
      full_name: fullName,
      role,
    },
    { onConflict: "id" },
  );

  if (upErr) {
    return {
      ok: false,
      nl: "Kon het bericht niet versturen. Vernieuw de pagina en probeer opnieuw.",
    };
  }

  return { ok: true };
}

export function dutchMessageForDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("foreign key") || m.includes("violates foreign key")) {
    return "De ontvanger heeft nog geen geldig account voor berichten.";
  }
  if (m.includes("not null")) {
    return "Bericht kon niet worden opgeslagen. Probeer het opnieuw.";
  }
  return "Bericht versturen is mislukt. Probeer het later opnieuw.";
}
