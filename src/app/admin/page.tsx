"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type QueueType = "dj_verification" | "dispute" | "booking";

type QueueItem = {
  id: string;
  type: QueueType;
  description: string;
  createdAt: string;
  actionHref: string;
  actionLabel: string;
};

function startOfCurrentMonthIso(): string {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString();
}

function ageLabel(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const ms = Date.now() - t;
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h < 1) return "Zojuist";
  if (h < 24) return `${h} uur`;
  const d = Math.floor(h / 24);
  return `${d} ${d === 1 ? "dag" : "dagen"}`;
}

function typeBadge(type: QueueType) {
  switch (type) {
    case "dj_verification":
      return {
        label: "DJ-verificatie",
        className: "bg-amber-500/15 text-amber-800 ring-amber-500/30",
      };
    case "dispute":
      return {
        label: "Geschil",
        className: "bg-red-500/15 text-red-800 ring-red-500/30",
      };
    case "booking":
      return {
        label: "Boeking",
        className: "bg-blue-500/15 text-blue-800 ring-blue-500/30",
      };
    default:
      return {
        label: type,
        className: "bg-neutral-100 text-neutral-700 ring-neutral-200",
      };
  }
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openDisputes, setOpenDisputes] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [revenueEuro, setRevenueEuro] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const monthStart = startOfCurrentMonthIso();
    const twelveHoursAgo = new Date(
      Date.now() - 12 * 60 * 60 * 1000,
    ).toISOString();

    const [
      disputesRes,
      pendingDjRes,
      confirmedRes,
      revenueRes,
      pendingProfilesRes,
      openDisputesListRes,
      stalePendingBookingsRes,
    ] = await Promise.all([
      supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("dj_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending"),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed"),
      supabase
        .from("bookings")
        .select("platform_fee")
        .eq("status", "confirmed")
        .gte("created_at", monthStart),
      supabase
        .from("dj_profiles")
        .select("id, stage_name, created_at")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("disputes")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: true }),
      supabase
        .from("bookings")
        .select("id, reference, created_at, status")
        .eq("status", "pending")
        .lt("created_at", twelveHoursAgo)
        .order("created_at", { ascending: true }),
    ]);

    const firstErr =
      disputesRes.error ||
      pendingDjRes.error ||
      confirmedRes.error ||
      revenueRes.error ||
      pendingProfilesRes.error ||
      openDisputesListRes.error ||
      stalePendingBookingsRes.error;

    if (firstErr) {
      setLoadError(firstErr.message);
      setLoading(false);
      return;
    }

    setOpenDisputes(disputesRes.count ?? 0);
    setPendingVerifications(pendingDjRes.count ?? 0);
    setActiveBookings(confirmedRes.count ?? 0);

    const fees = (revenueRes.data ?? []) as { platform_fee?: number | null }[];
    const feeSumCents = fees.reduce((acc, r) => {
      const v = r.platform_fee;
      if (typeof v === "number" && !Number.isNaN(v)) return acc + v;
      return acc;
    }, 0);
    setRevenueEuro(feeSumCents / 100);

    const items: QueueItem[] = [];

    const profiles = (pendingProfilesRes.data ?? []) as {
      id: string;
      stage_name?: string | null;
      created_at?: string | null;
    }[];
    for (const p of profiles) {
      const name =
        typeof p.stage_name === "string" && p.stage_name.trim()
          ? p.stage_name.trim()
          : "Onbekende DJ";
      const created = typeof p.created_at === "string" ? p.created_at : "";
      items.push({
        id: `dj-${p.id}`,
        type: "dj_verification",
        description: `${name} wacht op verificatie`,
        createdAt: created || new Date().toISOString(),
        actionHref: "/admin/verificaties",
        actionLabel: "Naar verificaties",
      });
    }

    const disputesList = (openDisputesListRes.data ?? []) as Record<
      string,
      unknown
    >[];
    for (const d of disputesList) {
      const id = String(d.id ?? "");
      const created =
        typeof d.created_at === "string" ? d.created_at : new Date().toISOString();
      const desc =
        (typeof d.title === "string" && d.title.trim()) ||
        (typeof d.subject === "string" && d.subject.trim()) ||
        (typeof d.description === "string" && d.description.trim()?.slice(0, 80)) ||
        `Geschil ${id.slice(0, 8)}`;
      items.push({
        id: `dispute-${id}`,
        type: "dispute",
        description: desc,
        createdAt: created,
        actionHref: "/admin/geschillen",
        actionLabel: "Open geschillen",
      });
    }

    const stale = (stalePendingBookingsRes.data ?? []) as {
      id: string;
      reference?: string | null;
      created_at?: string | null;
    }[];
    for (const b of stale) {
      const ref =
        typeof b.reference === "string" && b.reference.trim()
          ? b.reference.trim()
          : b.id.slice(0, 8);
      const created =
        typeof b.created_at === "string"
          ? b.created_at
          : new Date().toISOString();
      items.push({
        id: `booking-${b.id}`,
        type: "booking",
        description: `Aanvraag ${ref} wacht al langer dan 12 uur op reactie`,
        createdAt: created,
        actionHref: "/admin/boekingen",
        actionLabel: "Naar boekingen",
      });
    }

    items.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    setQueue(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="py-12 text-center text-neutral-600">Dashboard laden…</div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Overzicht en prioriteiten voor vandaag.
        </p>
      </div>

      {loadError ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Open geschillen
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-900">
            {openDisputes}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            DJ-verificaties in behandeling
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-900">
            {pendingVerifications}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Actieve boekingen
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-900">
            {activeBookings}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Omzet deze maand (platformfee)
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-neutral-900">
            €
            {revenueEuro.toLocaleString("nl-NL", {
              minimumFractionDigits: Number.isInteger(revenueEuro) ? 0 : 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <section aria-labelledby="priority-heading">
        <h2
          id="priority-heading"
          className="text-lg font-bold text-neutral-900"
        >
          Prioriteitenwachtrij
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Openstaande verificaties, geschillen en langlopende aanvragen.
        </p>

        {queue.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-600">
            Geen urgente items in de wachtrij.
          </p>
        ) : (
          <>
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-neutral-200 shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-neutral-700">
                      Omschrijving
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-700">
                      Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-700">
                      Leeftijd
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-700">
                      Actie
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {queue.map((row) => {
                    const badge = typeBadge(row.type);
                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {row.description}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {ageLabel(row.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={row.actionHref}
                            className="inline-flex rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                          >
                            {row.actionLabel}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="mt-6 space-y-3 md:hidden" aria-label="Prioriteiten">
              {queue.map((row) => {
                const badge = typeBadge(row.type);
                return (
                  <li
                    key={row.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-medium text-neutral-900">
                      {row.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {ageLabel(row.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={row.actionHref}
                      className="mt-3 inline-flex rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                    >
                      {row.actionLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
