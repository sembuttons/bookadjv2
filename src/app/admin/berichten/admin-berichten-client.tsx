"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type UserE = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  offense_count?: number | null;
  is_suspended?: boolean | null;
};

type Msg = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content?: string | null;
  created_at: string;
  is_flagged?: boolean | null;
  flag_reason?: string | null;
  inbox_type?: string | null;
  sender: UserE | null;
  recipient: UserE | null;
};

function userDisplay(u: UserE | null): string {
  if (!u) return "-";
  const n = u.full_name?.trim();
  if (n) return n;
  const em = u.email?.trim();
  if (em) return em.split("@")[0] || em;
  return "-";
}

function userEmailLine(u: UserE | null): string {
  return u?.email?.trim() || "";
}

function preview(text: string | null | undefined, max = 80): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t || "—";
  return `${t.slice(0, max)}…`;
}

type TabKey = "all" | "flagged" | "normal";

export function AdminBerichtenClient() {
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [stats, setStats] = useState({
    flaggedToday: 0,
    messagesToday: 0,
    suspendedUsers: 0,
  });
  const [acting, setActing] = useState<string | null>(null);
  const [modalMsg, setModalMsg] = useState<Msg | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Geen sessie.");
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/admin/messages?tab=${tab}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = (await res.json()) as {
      error?: string;
      messages?: Msg[];
      stats?: typeof stats;
    };
    if (!res.ok) {
      setError(json.error ?? "Laden mislukt.");
      setLoading(false);
      return;
    }
    setMessages(json.messages ?? []);
    if (json.stats) setStats(json.stats);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (
    messageId: string,
    action: "clear_flag" | "warn_user" | "suspend_user",
  ) => {
    setActing(messageId + action);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch("/api/admin/messages/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messageId, action }),
    });
    setActing(null);
    if (res.ok) {
      if (action === "clear_flag") setModalMsg(null);
      void load();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Berichten</h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor berichten tussen gebruikers.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-800 bg-[#0f172a] px-4 py-3 text-sm">
        <span>
          <span className="font-semibold text-white">{stats.flaggedToday}</span>
          <span className="text-gray-400"> gemarkeerd vandaag</span>
        </span>
        <span>
          <span className="font-semibold text-white">{stats.suspendedUsers}</span>
          <span className="text-gray-400"> opgeschorte accounts</span>
        </span>
        <span>
          <span className="font-semibold text-white">{stats.messagesToday}</span>
          <span className="text-gray-400"> berichten vandaag</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {(
          [
            { key: "all" as const, label: "Alle" },
            { key: "flagged" as const, label: "Gemarkeerd" },
            { key: "normal" as const, label: "Normaal" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === key
                ? "bg-gray-800 text-white ring-1 ring-gray-600"
                : "bg-[#0f172a]/80 text-gray-400 ring-1 ring-gray-800 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-gray-400">Laden…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0f172a]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Afzender</th>
                <th className="px-4 py-3">Ontvanger</th>
                <th className="px-4 py-3">Bericht</th>
                <th className="px-4 py-3">Datum/tijd</th>
                <th className="px-4 py-3">Gemarkeerd</th>
                <th className="px-4 py-3">Reden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {messages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Geen berichten.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr
                    key={m.id}
                    className={`cursor-pointer text-gray-200 hover:bg-gray-800/40 ${
                      m.is_flagged ? "bg-red-950/20" : ""
                    }`}
                    onClick={() => setModalMsg(m)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-white">
                        {userDisplay(m.sender)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userEmailLine(m.sender) || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-white">
                        {userDisplay(m.recipient)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userEmailLine(m.recipient) || "—"}
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3 align-top text-gray-300">
                      {preview(m.content)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-gray-400">
                      {new Date(m.created_at).toLocaleString("nl-NL")}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {m.is_flagged ? (
                        <span className="inline-flex rounded-full bg-red-500/25 px-2 py-0.5 text-[10px] font-bold uppercase text-red-200 ring-1 ring-red-500/50">
                          Ja
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Nee</span>
                      )}
                    </td>
                    <td className="max-w-[140px] px-4 py-3 align-top text-xs text-gray-400">
                      {m.is_flagged && m.flag_reason
                        ? m.flag_reason
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalMsg ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={() => setModalMsg(null)}
            aria-hidden
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-800 bg-[#0f172a] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Bericht</h2>
              <button
                type="button"
                onClick={() => setModalMsg(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                aria-label="Sluiten"
              >
                ✕
              </button>
            </div>
            {modalMsg.is_flagged ? (
              <p className="mt-2 inline-flex rounded-full bg-red-500/25 px-2 py-0.5 text-[10px] font-bold uppercase text-red-200">
                Gemarkeerd
                {modalMsg.flag_reason ? `: ${modalMsg.flag_reason}` : ""}
              </p>
            ) : null}
            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Afzender
                </p>
                <p className="text-white">{userDisplay(modalMsg.sender)}</p>
                <p className="text-xs text-gray-500">
                  {userEmailLine(modalMsg.sender) || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Ontvanger
                </p>
                <p className="text-white">{userDisplay(modalMsg.recipient)}</p>
                <p className="text-xs text-gray-500">
                  {userEmailLine(modalMsg.recipient) || "—"}
                </p>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-[#111827] p-4 text-sm text-gray-100 ring-1 ring-gray-800">
              {modalMsg.content ?? "—"}
            </p>
            <p className="mt-3 text-xs text-gray-500">
              {new Date(modalMsg.created_at).toLocaleString("nl-NL")}
            </p>
            <Link
              href={`/admin/berichten/gesprek/${modalMsg.sender_id}/${modalMsg.recipient_id}`}
              className="mt-4 inline-block text-sm font-semibold text-green-400 underline"
            >
              Bekijk volledig gesprek
            </Link>
            {modalMsg.is_flagged ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-800 pt-4">
                <button
                  type="button"
                  disabled={!!acting}
                  onClick={() => void runAction(modalMsg.id, "clear_flag")}
                  className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  Vlag verwijderen
                </button>
                <button
                  type="button"
                  disabled={!!acting}
                  onClick={() => void runAction(modalMsg.id, "warn_user")}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  Waarschuw afzender
                </button>
                <button
                  type="button"
                  disabled={!!acting}
                  onClick={() => void runAction(modalMsg.id, "suspend_user")}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  Schors afzender
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
