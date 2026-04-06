"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getGenres,
  getHourlyRate,
  type DjProfileRow,
} from "@/lib/dj-profile-helpers";
import { supabase } from "@/lib/supabase-browser";

function formatCreatedAt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminVerificatiesPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<DjProfileRow[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setLoadError("Niet ingelogd.");
      setProfiles([]);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/verifications/pending", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = (await res.json()) as { data?: unknown; error?: string };
    if (!res.ok) {
      setLoadError(json.error ?? "Kon verificaties niet laden.");
      setProfiles([]);
    } else {
      setProfiles((json.data as DjProfileRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = useCallback(
    async (id: string) => {
      setActionId(id);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setActionId(null);
        setLoadError("Niet ingelogd.");
        return;
      }

      const res = await fetch("/api/admin/verifications/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const json = (await res.json()) as { error?: string };
      setActionId(null);
      if (!res.ok) {
        setLoadError(json.error ?? "Actie mislukt.");
        return;
      }
      await load();
    },
    [load],
  );

  const reject = useCallback(
    async (id: string) => {
      setActionId(id);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setActionId(null);
        setLoadError("Niet ingelogd.");
        return;
      }

      const res = await fetch("/api/admin/verifications/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action: "reject" }),
      });
      const json = (await res.json()) as { error?: string };
      setActionId(null);
      if (!res.ok) {
        setLoadError(json.error ?? "Actie mislukt.");
        return;
      }
      await load();
    },
    [load],
  );

  if (loading) {
    return (
      <div className="py-12 text-center text-ink-secondary">Laden…</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          DJ-verificaties
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Beoordeel nieuwe DJ-profielen voordat ze zichtbaar worden.
        </p>
      </div>

      {loadError ? (
        <p
          className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {profiles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface-muted px-6 py-12 text-center text-sm text-ink-secondary">
          Geen verificaties in behandeling
        </p>
      ) : (
        <ul className="space-y-6">
          {profiles.map((row) => {
            const id = row.id;
            const stage =
              typeof row.stage_name === "string" && row.stage_name.trim()
                ? row.stage_name.trim()
                : "—";
            const city =
              typeof row.city === "string" && row.city.trim()
                ? row.city.trim()
                : "—";
            const genres = getGenres(row);
            const rate = getHourlyRate(row);
            const bio =
              typeof row.bio === "string" && row.bio.trim()
                ? row.bio.trim()
                : "—";
            const vat =
              typeof row.vat_number === "string" && row.vat_number.trim()
                ? row.vat_number.trim()
                : "—";
            const kvk =
              typeof row.kvk_number === "string" && row.kvk_number.trim()
                ? row.kvk_number.trim()
                : "—";
            const created =
              typeof row.created_at === "string" ? row.created_at : null;
            const busy = actionId === id;

            return (
              <li key={id}>
                <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-ink">
                        {stage}
                      </h2>
                      <p className="mt-1 text-sm text-ink-muted">
                        Aangemeld {formatCreatedAt(created)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void approve(id)}
                        className="rounded-lg bg-bookadj px-4 py-2.5 text-sm font-semibold text-white hover:bg-bookadj-hover disabled:opacity-50"
                      >
                        {busy ? "Bezig…" : "Goedkeuren"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void reject(id)}
                        className="rounded-lg border border-danger/35 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20 disabled:opacity-50"
                      >
                        Afwijzen
                      </button>
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-ink-muted">Stad</dt>
                      <dd className="mt-0.5 font-medium text-ink">
                        {city}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Uurtarief</dt>
                      <dd className="mt-0.5 font-medium text-ink">
                        {rate != null
                          ? `€${rate.toLocaleString("nl-NL")}/uur`
                          : "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-ink-muted">Genres</dt>
                      <dd className="mt-0.5 font-medium text-ink">
                        {genres.length ? genres.join(", ") : "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-ink-muted">Bio</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-ink">
                        {bio}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">BTW-nummer</dt>
                      <dd className="mt-0.5 font-mono text-sm font-medium text-ink">
                        {vat}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">KVK-nummer</dt>
                      <dd className="mt-0.5 font-mono text-sm font-medium text-ink">
                        {kvk}
                      </dd>
                    </div>
                  </dl>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
