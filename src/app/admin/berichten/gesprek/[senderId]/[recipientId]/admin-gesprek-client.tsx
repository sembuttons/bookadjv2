"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { messageText, type MessageRow } from "@/lib/messaging-utils";
import { supabase } from "@/lib/supabase";

type UserE = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  offense_count?: number | null;
  is_suspended?: boolean | null;
};

export function AdminGesprekClient({
  senderId,
  recipientId,
}: {
  senderId: string;
  recipientId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [userA, setUserA] = useState<UserE | null>(null);
  const [userB, setUserB] = useState<UserE | null>(null);

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
    const res = await fetch(
      `/api/admin/messages/thread?a=${encodeURIComponent(senderId)}&b=${encodeURIComponent(recipientId)}`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    );
    const json = (await res.json()) as {
      error?: string;
      messages?: MessageRow[];
      userA?: UserE | null;
      userB?: UserE | null;
    };
    if (!res.ok) {
      setError(json.error ?? "Laden mislukt.");
      setLoading(false);
      return;
    }
    setMessages(json.messages ?? []);
    setUserA(json.userA ?? null);
    setUserB(json.userB ?? null);
    setLoading(false);
  }, [recipientId, senderId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/berichten"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M12.5 15L7.5 10l5-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        Terug naar berichten
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900">Gesprek</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {[userA, userB].map((u) =>
          u ? (
            <div
              key={u.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm"
            >
              <p className="font-semibold text-neutral-900">
                {u.full_name ?? u.email}
              </p>
              <p className="text-neutral-600">{u.email}</p>
              <p className="mt-2 text-neutral-600">
                Overtredingen: {u.offense_count ?? 0}
              </p>
              <p className="text-neutral-600">
                Status:{" "}
                {u.is_suspended ? (
                  <span className="font-semibold text-red-600">
                    Opgeschort
                  </span>
                ) : (
                  <span className="text-emerald-700">Actief</span>
                )}
              </p>
            </div>
          ) : null,
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : loading ? (
        <p className="text-neutral-600">Laden…</p>
      ) : (
        <ul className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                m.is_flagged
                  ? "bg-orange-50 ring-1 ring-orange-200"
                  : "bg-neutral-50"
              }`}
            >
              <p className="text-xs font-medium text-neutral-500">
                {m.sender_id === senderId ? "Afzender A" : "Afzender B"} ·{" "}
                {new Date(m.created_at).toLocaleString("nl-NL")}
                {m.is_flagged ? (
                  <span className="ml-2 text-orange-600">Gemarkeerd</span>
                ) : null}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-neutral-900">
                {messageText(m)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
