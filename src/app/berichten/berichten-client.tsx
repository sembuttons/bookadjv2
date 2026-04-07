"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Calendar, ChevronLeft, Search, Send } from "lucide-react";
import {
  groupLatestByPartner,
  initials,
  messageText,
  normalizeUserUuid,
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

const formatMessageTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const formatTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (days === 1) return "Gisteren";
    if (days < 7) return date.toLocaleDateString("nl-NL", { weekday: "short" });
    return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
};

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
  const [displayNameMap, setDisplayNameMap] = useState<Record<string, string>>(
    {},
  );
  const [tab, setTab] = useState<TabKey>("ask");
  const [search, setSearch] = useState("");
  const [activePartner, setActivePartner] = useState<string | null>(null);
  const [mobileThread, setMobileThread] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const partnerFromUrl = searchParams.get("met") ?? initialPartnerId;

  const loadUsers = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    const uniq = [...new Set(ids)];
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", uniq);
    const rows = (data ?? []) as UserPreview[];
    setUserMap((prev) => ({
      ...prev,
      ...Object.fromEntries(rows.map((u) => [u.id, u])),
    }));

    // Prefer DJ stage_name when available.
    const { data: djRows } = await supabase
      .from("dj_profiles")
      .select("user_id, stage_name")
      .in("user_id", uniq);
    const list = (djRows ?? []) as { user_id?: string; stage_name?: string }[];

    setDisplayNameMap((prev) => {
      const next = { ...prev };
      for (const id of uniq) {
        const stage =
          list.find((r) => r.user_id === id)?.stage_name?.trim() || "";
        const u = rows.find((r) => r.id === id);
        const full = u?.full_name?.trim() || "";
        const emailPrefix = u?.email?.split("@")[0]?.trim() || "";
        const name = stage || full || emailPrefix || "Gebruiker";
        next[id] = name;
      }
      return next;
    });
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
    const rawPid = threadOnly ? initialPartnerId : partnerFromUrl;
    const pid = normalizeUserUuid(rawPid);
    const self = normalizeUserUuid(userId);
    if (!pid) return;
    if (self && pid === self) {
      setActivePartner(null);
      setMobileThread(threadOnly);
      return;
    }
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

  const partnerName = useCallback(
    (id: string) =>
      displayNameMap[id] ||
      userMap[id]?.full_name?.trim() ||
      userMap[id]?.email?.split("@")[0] ||
      "Gebruiker",
    [displayNameMap, userMap],
  );

  const conversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...latestByPartner.entries()].map(([partnerId, last]) => ({
      partnerId,
      last,
      name: partnerName(partnerId),
    }));
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [latestByPartner, partnerName, search]);

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
    const nid = normalizeUserUuid(id);
    const self = normalizeUserUuid(userId);
    if (!nid) return;
    if (self && nid === self) {
      return;
    }
    setActivePartner(nid);
    setMobileThread(true);
    void loadUsers([nid]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    const partner = normalizeUserUuid(activePartner);
    const self = normalizeUserUuid(userId);
    if (!text || !self || !partner || sending) return;
    setSending(true);
    setSendError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setSending(false);
      return;
    }

    console.log("Sending message:", {
      sender_id: session.user.id,
      recipient_id: partner,
      content: text,
    });

    const { data, error } = await supabase.from("messages").insert({
      sender_id: session.user.id,
      recipient_id: partner,
      content: text,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    console.log("Insert result:", { data, error });

    setSending(false);
    if (error) {
      console.error("Send error:", error);
      setSendError(error.message);
      return;
    }
    setInput("");
    await refreshMessages();
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

  if (loading || !userId) {
    return (
      <div
        className="flex min-h-[40vh] flex-col gap-4 md:flex-row md:rounded-2xl md:border md:border-gray-800 md:bg-[#111827] md:p-4"
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
      className={`flex min-h-[calc(100vh-8rem)] flex-col bg-white md:flex-row md:rounded-2xl md:border md:border-gray-200 md:shadow-sm ${
        threadOnly ? "min-h-[60vh] md:min-h-[520px]" : ""
      }`}
    >
      {!threadOnly ? (
        <div
          className={`w-80 border-r border-gray-200 bg-white flex flex-col h-full ${
            mobileThread && activePartner ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">Berichten</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Deel geen contactgegevens buiten het platform
            </p>
          </div>

          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Zoek gesprekken..."
                className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map(({ partnerId, last, name }) => {
              const unreadCount = allMessages.filter(
                (m) =>
                  m.sender_id === partnerId &&
                  m.recipient_id === userId &&
                  m.is_read === false,
              ).length;
              const active = activePartner === partnerId;
              return (
                <div
                  key={partnerId}
                  onClick={() => selectConversation(partnerId)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    active ? "bg-green-50 border-l-4 border-l-green-500" : ""
                  }`}
                >
                  <div className="relative flex-none">
                    <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm">
                      {initials(name)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {name}
                      </p>
                      <span className="text-gray-400 text-xs flex-none ml-2">
                        {formatTime(last.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-gray-500 text-xs truncate">
                        {messageText(last)}
                      </p>
                      {unreadCount > 0 ? (
                        <span className="bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-none ml-2">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                Nog geen gesprekken
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        className={`flex-1 flex flex-col h-full bg-gray-50 ${
          threadOnly
            ? "flex"
            : !mobileThread || !activePartner
              ? "hidden md:flex"
              : "flex"
        }`}
      >
        {!activePartner ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <IconChatEmpty className="text-gray-400" />
            <p className="text-sm font-medium text-gray-400">
              {threadOnly ? "Gesprek laden…" : "Selecteer een gesprek"}
            </p>
            {threadOnly ? (
              <Link
                href="/berichten"
                className="text-sm font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
              >
                Naar alle berichten
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-1 -ml-1 rounded-lg hover:bg-gray-100"
                onClick={() => setActivePartner(null)}
                aria-label="Terug"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" aria-hidden />
              </button>

              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm">
                  {initials(partnerName(activePartner))}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {partnerName(activePartner)}
                </p>
                <p className="text-green-500 text-xs">Online</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Boeking bekijken"
                >
                  <Calendar className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {threadMessages.map((msg, i) => {
                const isMine = msg.sender_id === userId;
                const prev = threadMessages[i - 1];
                const showDate =
                  !prev ||
                  threadDateLabel(prev.created_at) !==
                    threadDateLabel(msg.created_at);
                const showAvatar =
                  !isMine &&
                  (i === 0 || threadMessages[i - 1].sender_id !== msg.sender_id);

                return (
                  <div key={msg.id}>
                    {showDate ? (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">
                          {threadDateLabel(msg.created_at)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    ) : null}

                    <div
                      className={`flex items-end gap-2 ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isMine ? (
                        <div
                          className={`w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-none ${
                            showAvatar ? "" : "invisible"
                          }`}
                        >
                          {initials(partnerName(activePartner))}
                        </div>
                      ) : null}

                      <div
                        className={`max-w-[70%] ${
                          isMine ? "items-end" : "items-start"
                        } flex flex-col gap-1`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-green-500 text-white rounded-br-sm"
                              : "bg-white text-gray-900 rounded-bl-sm border border-gray-100 shadow-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {messageText(msg)}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 px-1">
                          {formatMessageTime(msg.created_at)}
                          {isMine ? (
                            <span className="ml-1">
                              {msg.is_read ? "✓✓" : "✓"}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={threadEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-3 text-center">
                Deel geen telefoonnummers of betaalverzoeken buiten het platform
              </p>

              {sendError ? (
                <p className="mb-2 text-sm text-red-600 text-center">
                  {sendError}
                </p>
              ) : null}

              <div className="flex items-end gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10 transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        void sendMessage();
                      }
                    }}
                    placeholder="Typ een bericht... (Enter om te sturen)"
                    rows={1}
                    className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none max-h-32 overflow-y-auto"
                    style={{ minHeight: "24px" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 bg-green-500 hover:bg-green-400 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-none"
                  aria-label="Verstuur"
                >
                  <Send className="w-4 h-4 text-white" aria-hidden />
                </button>
              </div>

              <p className="text-[10px] text-gray-300 mt-2 text-center">
                Shift+Enter voor nieuwe regel
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
