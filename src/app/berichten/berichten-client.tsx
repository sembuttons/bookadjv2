"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  groupLatestByPartner,
  initials,
  messageText,
  relativeTime,
  threadDateLabel,
  type MessageRow,
  type UserPreview,
} from "@/lib/messaging-utils";
import { Skeleton } from "@/components/skeleton";
import { supabase } from "@/lib/supabase-browser";

function IconChatEmpty({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 20c0-3.3 2.7-6 6-6h28c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H22l-10 8V20z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="28" r="2" fill="currentColor" />
      <circle cx="32" cy="28" r="2" fill="currentColor" />
      <circle cx="40" cy="28" r="2" fill="currentColor" />
    </svg>
  );
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 10l16-7-7 16-2-6-7-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWarning({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 3L2 17h16L10 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 8v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconBack({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M12.5 15L7.5 10l5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const INBOX_BOOK = "book_me";
const INBOX_ASK = "ask_me";

type TabKey = "booking" | "ask";

type Props = {
  /** Pre-open this partner (DJ user id). */
  initialPartnerId?: string | null;
  /** Direct thread route: only chat UI, no inbox list. */
  threadOnly?: boolean;
};

export function BerichtenClient({
  initialPartnerId = null,
  threadOnly = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allMessages, setAllMessages] = useState<MessageRow[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserPreview>>({});
  const [tab, setTab] = useState<TabKey>("ask");
  const [search, setSearch] = useState("");
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [mobileThread, setMobileThread] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const partnerFromUrl = searchParams.get("met") ?? initialPartnerId;

  const loadUsers = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", [...new Set(ids)]);
    const rows = (data ?? []) as UserPreview[];
    setUserMap((prev) => ({
      ...prev,
      ...Object.fromEntries(rows.map((u) => [u.id, u])),
    }));
  }, []);

  const refreshMessages = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const uid = session.user.id;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return;
    const rows = (data ?? []) as MessageRow[];
    setAllMessages(rows);
    const ids = new Set<string>();
    for (const m of rows) {
      ids.add(m.sender_id);
      ids.add(m.recipient_id);
    }
    await loadUsers([...ids]);
  }, [loadUsers]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.user) {
        router.replace(
          `/auth?returnTo=${encodeURIComponent(
            threadOnly && initialPartnerId
              ? `/berichten/${initialPartnerId}`
              : "/berichten",
          )}`,
        );
        return;
      }
      setUserId(session.user.id);
      setLoading(false);
      await refreshMessages();
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPartnerId, refreshMessages, router, threadOnly]);

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MessageRow;
          if (row.sender_id !== userId && row.recipient_id !== userId) return;
          setAllMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [row, ...prev];
          });
          if (
            row.sender_id !== userId &&
            document.visibilityState !== "visible"
          ) {
            try {
              new Notification("Nieuw bericht", {
                body: "Je hebt een nieuw bericht op bookadj.",
              });
            } catch {
              /* Notification API optioneel */
            }
          }
          void loadUsers([row.sender_id, row.recipient_id]);
        },
      )
      .subscribe();
    channelRef.current = ch;
    return () => {
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [userId, loadUsers]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const pid = threadOnly ? initialPartnerId : partnerFromUrl;
    if (!pid) return;
    setActivePartner(pid);
    setMobileThread(true);
    void loadUsers([pid]);
  }, [initialPartnerId, loadUsers, partnerFromUrl, threadOnly, userId]);

  const tabInboxType = tab === "booking" ? INBOX_BOOK : INBOX_ASK;

  const filteredForTab = useMemo(
    () => allMessages.filter((m) => m.inbox_type === tabInboxType),
    [allMessages, tabInboxType],
  );

  const latestByPartner = useMemo(() => {
    if (!userId) return new Map<string, MessageRow>();
    return groupLatestByPartner(filteredForTab, userId);
  }, [filteredForTab, userId]);

  const conversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...latestByPartner.entries()].map(([partnerId, last]) => ({
      partnerId,
      last,
      name:
        userMap[partnerId]?.full_name?.trim() ||
        userMap[partnerId]?.email ||
        "Gebruiker",
    }));
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [latestByPartner, search, userMap]);

  const unreadByTab = useMemo(() => {
    if (!userId) return { booking: 0, ask: 0 };
    let booking = 0;
    let ask = 0;
    for (const m of allMessages) {
      if (m.recipient_id !== userId || m.is_read) continue;
      if (m.inbox_type === INBOX_BOOK) booking += 1;
      else if (m.inbox_type === INBOX_ASK) ask += 1;
    }
    return { booking, ask };
  }, [allMessages, userId]);

  const threadMessages = useMemo(() => {
    if (!userId || !activePartner) return [];
    return allMessages
      .filter(
        (m) =>
          (m.sender_id === userId && m.recipient_id === activePartner) ||
          (m.sender_id === activePartner && m.recipient_id === userId),
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
  }, [allMessages, activePartner, userId]);

  useEffect(() => {
    if (!userId || !activePartner) return;
    void (async () => {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("recipient_id", userId)
        .eq("sender_id", activePartner)
        .eq("is_read", false);
      setAllMessages((prev) =>
        prev.map((m) =>
          m.recipient_id === userId &&
          m.sender_id === activePartner &&
          m.is_read === false
            ? { ...m, is_read: true }
            : m,
        ),
      );
    })();
  }, [activePartner, userId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length, activePartner]);

  const selectConversation = (id: string) => {
    setActivePartner(id);
    setMobileThread(true);
    setBanner(null);
    void loadUsers([id]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !userId || !activePartner || sending) return;
    setSending(true);
    setBanner(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setSending(false);
      return;
    }
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        content: text,
        sender_id: userId,
        recipient_id: activePartner,
        inbox_type: tabInboxType,
        booking_id: null,
      }),
    });
    const json = (await res.json()) as {
      error?: string;
      message?: MessageRow;
      warning?: string | null;
      isFlagged?: boolean;
    };
    setSending(false);
    if (!res.ok) {
      setBanner(json.error ?? "Versturen mislukt.");
      return;
    }
    if (json.message) {
      setAllMessages((prev) => {
        if (prev.some((m) => m.id === json.message!.id)) return prev;
        return [json.message!, ...prev];
      });
    }
    setInput("");
    if (json.warning) setBanner(json.warning);
  };

  const partnerHasUnread = (partnerId: string) => {
    if (!userId) return false;
    return allMessages.some(
      (m) =>
        m.sender_id === partnerId &&
        m.recipient_id === userId &&
        m.is_read === false,
    );
  };

  const partnerName = (id: string) =>
    userMap[id]?.full_name?.trim() || userMap[id]?.email || "Gebruiker";

  if (loading || !userId) {
    return (
      <div
        className="flex min-h-[40vh] flex-col gap-4 md:flex-row md:rounded-2xl md:border md:border-neutral-200 md:bg-white md:p-4"
        aria-busy
        aria-label="Berichten laden"
      >
        <div className="hidden w-full space-y-3 md:block md:w-[280px] md:shrink-0">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 md:py-0">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[calc(100vh-8rem)] flex-col bg-white md:flex-row md:rounded-2xl md:border md:border-neutral-200 md:shadow-sm ${
        threadOnly ? "min-h-[60vh] md:min-h-[520px]" : ""
      }`}
    >
      {!threadOnly ? (
      <div
        className={`flex w-full flex-col border-neutral-200 md:w-[320px] md:shrink-0 md:border-r ${
          mobileThread && activePartner ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex gap-1 border-b border-neutral-200 p-3">
          <button
            type="button"
            onClick={() => {
              setTab("booking");
              setActivePartner(null);
              setMobileThread(false);
            }}
            className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
              tab === "booking"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            Boekingsberichten
            {unreadByTab.booking > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {unreadByTab.booking > 9 ? "9+" : unreadByTab.booking}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("ask");
              setActivePartner(null);
              setMobileThread(false);
            }}
            className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
              tab === "ask"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            Vragen
            {unreadByTab.ask > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {unreadByTab.ask > 9 ? "9+" : unreadByTab.ask}
              </span>
            ) : null}
          </button>
        </div>
        <div className="border-b border-neutral-200 p-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam…"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
          />
        </div>
        <ul className="max-h-[50vh] flex-1 overflow-y-auto md:max-h-none">
          {conversations.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-neutral-500">
              Geen gesprekken in deze tab.
            </li>
          ) : (
            conversations.map(({ partnerId, last, name }) => (
              <li key={partnerId}>
                <button
                  type="button"
                  onClick={() => selectConversation(partnerId)}
                  className={`flex w-full gap-3 border-b border-neutral-100 px-3 py-3 text-left transition-colors hover:bg-neutral-50 ${
                    activePartner === partnerId ? "bg-neutral-100" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                    {initials(name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-neutral-900">
                        {name}
                      </span>
                      {partnerHasUnread(partnerId) ? (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-orange-500"
                          aria-label="Ongelezen"
                        />
                      ) : null}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                      {messageText(last).slice(0, 40)}
                      {messageText(last).length > 40 ? "…" : ""}
                    </span>
                    <span className="mt-1 text-[11px] text-neutral-400">
                      {relativeTime(last.created_at)}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      ) : null}

      <div
        className={`flex min-h-[50vh] flex-1 flex-col bg-neutral-50/50 ${
          threadOnly
            ? "flex"
            : !mobileThread || !activePartner
              ? "hidden md:flex"
              : "flex"
        }`}
      >
        {!activePartner ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <IconChatEmpty className="text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">
              {threadOnly ? "Gesprek laden…" : "Selecteer een gesprek"}
            </p>
            {threadOnly ? (
              <Link
                href="/berichten"
                className="text-sm font-semibold text-neutral-900 underline"
              >
                Naar alle berichten
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-3 py-3">
              {threadOnly ? (
                <a
                  href="/berichten"
                  className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
                  aria-label="Terug naar berichten"
                >
                  <IconBack />
                </a>
              ) : (
                <button
                  type="button"
                  className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
                  aria-label="Terug"
                  onClick={() => {
                    setMobileThread(false);
                    setActivePartner(null);
                  }}
                >
                  <IconBack />
                </button>
              )}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                {initials(partnerName(activePartner))}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900">
                  {partnerName(activePartner)}
                </p>
                <p className="text-xs text-emerald-600">Online</p>
              </div>
            </div>

            {banner ? (
              <div className="mx-3 mt-3 flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-950">
                <IconWarning className="mt-0.5 shrink-0 text-orange-600" />
                <span>{banner}</span>
              </div>
            ) : null}

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
                {threadMessages.map((m, idx) => {
                  const mine = m.sender_id === userId;
                  const prev = threadMessages[idx - 1];
                  const showDate =
                    !prev ||
                    threadDateLabel(prev.created_at) !==
                      threadDateLabel(m.created_at);
                  return (
                    <div key={m.id}>
                      {showDate ? (
                        <p className="mb-3 text-center text-xs font-medium text-neutral-400">
                          {threadDateLabel(m.created_at)}
                        </p>
                      ) : null}
                      <div
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            mine
                              ? "bg-black text-white"
                              : "bg-white text-neutral-900 ring-1 ring-neutral-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {messageText(m)}
                          </p>
                          {mine && m.is_flagged ? (
                            <p className="mt-1 text-[10px] font-semibold text-orange-300">
                              Gemarkeerd
                            </p>
                          ) : null}
                          <p
                            className={`mt-1 text-[10px] ${
                              mine ? "text-white/60" : "text-neutral-400"
                            }`}
                          >
                            {formatTime(m.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              <div className="border-t border-neutral-200 bg-white px-3 py-3">
                <div
                  className="mb-2 flex gap-1 px-1"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-300 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-300 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-300 [animation-delay:300ms]" />
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage();
                      }
                    }}
                    rows={Math.min(4, Math.max(1, input.split("\n").length))}
                    placeholder="Schrijf een bericht…"
                    className="min-h-[44px] flex-1 resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    disabled={sending || !input.trim()}
                    onClick={() => void sendMessage()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-colors hover:bg-neutral-900 disabled:opacity-40"
                    aria-label="Verstuur"
                  >
                    <IconSend />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
