"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserE = {
  id: string;
  full_name?: string | null;
  email?: string | null;
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

function initials(name: string, email?: string | null) {
  const n = name.trim();
  if (n) {
    const p = n.split(/\s+/).filter(Boolean).slice(0, 2);
    const s = p.map((x) => x[0]?.toUpperCase() ?? "").join("");
    if (s) return s;
  }
  if (email && email.length >= 2) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function AdminBerichtenClient() {
  const [tab, setTab] = useState<"flagged" | "all">("flagged");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [stats, setStats] = useState({
    flaggedToday: 0,
    messagesToday: 0,
    suspendedUsers: 0,
  });
  const [acting, setActing] = useState<string | null>(null);

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
    if (res.ok) void load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Berichten</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Monitor gemarkeerde berichten en gebruikers.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
        <span>
          <span className="font-semibold text-neutral-900">
            {stats.flaggedToday}
          </span>
          <span className="text-neutral-600"> gemarkeerd vandaag</span>
        </span>
        <span>
          <span className="font-semibold text-neutral-900">
            {stats.suspendedUsers}
          </span>
          <span className="text-neutral-600"> opgeschorte accounts</span>
        </span>
        <span>
          <span className="font-semibold text-neutral-900">
            {stats.messagesToday}
          </span>
          <span className="text-neutral-600"> berichten vandaag</span>
        </span>
      </div>

      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("flagged")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "flagged"
              ? "bg-black text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Gemarkeerd
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "all"
              ? "bg-black text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Alle berichten
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-neutral-600">Laden…</p>
      ) : (
        <ul className="space-y-4">
          {messages.length === 0 ? (
            <li className="text-sm text-neutral-500">Geen berichten.</li>
          ) : (
            messages.map((m) => (
              <li
                key={m.id}
                className={`rounded-2xl border p-5 ${
                  m.is_flagged
                    ? "border-orange-200 bg-orange-50/50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                {m.is_flagged ? (
                  <p className="mb-3 inline-block rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Gemarkeerd
                    {m.flag_reason ? ` — ${m.flag_reason}` : ""}
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-neutral-500">
                      Afzender
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                        {initials(
                          m.sender?.full_name ?? "",
                          m.sender?.email,
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {m.sender?.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {m.sender?.email}
                        </p>
                        <p className="text-xs text-neutral-600">
                          Overtredingen:{" "}
                          <span className="font-semibold">
                            {m.sender?.offense_count ?? 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-neutral-500">
                      Ontvanger
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-800">
                        {initials(
                          m.recipient?.full_name ?? "",
                          m.recipient?.email,
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {m.recipient?.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {m.recipient?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap rounded-lg bg-white/80 p-3 text-sm text-neutral-800 ring-1 ring-neutral-100">
                  {m.content ?? "—"}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  {new Date(m.created_at).toLocaleString("nl-NL")}
                </p>
                <Link
                  href={`/admin/berichten/gesprek/${m.sender_id}/${m.recipient_id}`}
                  className="mt-3 inline-block text-sm font-semibold text-neutral-900 underline"
                >
                  Bekijk volledig gesprek
                </Link>
                {m.is_flagged ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!!acting}
                      onClick={() => void runAction(m.id, "clear_flag")}
                      className="rounded-lg bg-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-300 disabled:opacity-50"
                    >
                      Geen actie
                    </button>
                    <button
                      type="button"
                      disabled={!!acting}
                      onClick={() => void runAction(m.id, "warn_user")}
                      className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      Waarschuw gebruiker
                    </button>
                    <button
                      type="button"
                      disabled={!!acting}
                      onClick={() => void runAction(m.id, "suspend_user")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Blokkeer gebruiker
                    </button>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
