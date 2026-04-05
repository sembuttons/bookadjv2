"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const OPEN_EVENT = "bookadj:open-ask-dj";

type Props = {
  djUserId: string;
  returnToPath: string;
};

export function AskDjModalHost({ djUserId, returnToPath }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
      setError(null);
      setSuccess(false);
      setMessage("");
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
    setSuccess(false);
    setMessage("");
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    const body = message.trim();
    if (!body) {
      setError("Schrijf een korte vraag.");
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      router.push(
        `/auth?returnTo=${encodeURIComponent(returnToPath)}`,
      );
      close();
      return;
    }
    setSending(true);
    const row = {
      inbox_type: "ask_me",
      sender_id: session.user.id,
      recipient_id: djUserId,
      booking_id: null as string | null,
      body,
    };
    const { error: insErr } = await supabase.from("messages").insert(row);
    setSending(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setSuccess(true);
    setMessage("");
  }, [close, djUserId, message, returnToPath, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-dj-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluiten"
        onClick={close}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="ask-dj-title"
            className="text-lg font-bold text-neutral-900"
          >
            Stel een vraag
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Sluiten"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Je bericht gaat direct naar deze DJ. Geen boeking nodig.
        </p>

        {success ? (
          <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950">
            Bericht verstuurd!
          </p>
        ) : (
          <>
            <label className="mt-4 block">
              <span className="sr-only">Bericht</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Waar wil je meer over weten?"
                className="w-full resize-y rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-black/10"
              />
            </label>
            {error ? (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={sending}
              onClick={() => void submit()}
              className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-900 disabled:opacity-60"
            >
              {sending ? "Versturen…" : "Verstuur bericht"}
            </button>
          </>
        )}

        {success ? (
          <button
            type="button"
            onClick={close}
            className="mt-4 w-full rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            Sluiten
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function openAskDjModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

export function AskDjLauncherButton({
  className,
  children = "Stel een vraag",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => openAskDjModal()}
      className={className}
    >
      {children}
    </button>
  );
}
