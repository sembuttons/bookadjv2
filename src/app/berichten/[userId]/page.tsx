import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BerichtenClient } from "../berichten-client";
import { supabaseAdmin } from "@/lib/supabase-server";

type PageProps = { params: Promise<{ userId: string }> };

export default async function BerichtenThreadPage({ params }: PageProps) {
  const { userId: raw } = await params;
  const decoded = decodeURIComponent(raw ?? "").trim();

  const { data: asProfile } = await supabaseAdmin
    .from("dj_profiles")
    .select("user_id")
    .eq("id", decoded)
    .maybeSingle();

  const prof = asProfile as { user_id?: string | null } | null;
  const ownerAuth =
    typeof prof?.user_id === "string" && prof.user_id.trim()
      ? prof.user_id.trim()
      : "";

  if (ownerAuth) {
    redirect(`/berichten/${encodeURIComponent(ownerAuth)}`);
  }

  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-ink-secondary">Laden…</div>
      }
    >
      <BerichtenClient initialPartnerId={decoded} threadOnly />
    </Suspense>
  );
}
