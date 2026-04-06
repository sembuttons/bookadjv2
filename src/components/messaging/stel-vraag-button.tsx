"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Props = {
  /** Auth user id of the DJ when already known (server-resolved). */
  djUserId?: string | null;
  /** DJ profile row id — used to resolve auth user id when djUserId is empty. */
  djProfileId?: string;
  className?: string;
  children?: React.ReactNode;
};

export function StelVraagButton({
  djUserId,
  djProfileId,
  className,
  children,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-1 sm:max-w-md sm:items-end sm:self-end">
      <button
        type="button"
        disabled={busy}
        className={className}
        onClick={async () => {
          setError(null);
          let uid = djUserId?.trim() ?? "";

          if (!uid && djProfileId?.trim()) {
            setBusy(true);
            try {
              const r = await fetch(
                `/api/dj-profile/${encodeURIComponent(djProfileId.trim())}/owner-user`,
              );
              const j = (await r.json()) as { userId?: string; error?: string };
              if (r.ok && j.userId?.trim()) {
                uid = j.userId.trim();
              } else {
                setError(
                  j.error ??
                    "Kon geen chat starten. Probeer het later opnieuw of neem contact op met support.",
                );
                setBusy(false);
                return;
              }
            } catch {
              setError("Netwerkfout. Controleer je verbinding en probeer opnieuw.");
              setBusy(false);
              return;
            }
            setBusy(false);
          }

          if (!uid) {
            setError(
              "Berichten zijn voor dit profiel tijdelijk niet beschikbaar.",
            );
            return;
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();
          const path = `/berichten/${encodeURIComponent(uid)}`;
          const qs = new URLSearchParams({ returnTo: path, redirect: path });
          if (!session) {
            router.push(`/auth?${qs.toString()}`);
            return;
          }
          router.push(path);
        }}
      >
        {busy ? "Even geduld…" : (children ?? "Stel een vraag")}
      </button>
      {error ? (
        <p className="max-w-sm text-center text-xs text-red-600 sm:text-right">
          {error}
        </p>
      ) : null}
    </div>
  );
}
