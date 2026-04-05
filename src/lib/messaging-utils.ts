import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { nl } from "date-fns/locale";

export type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content?: string | null;
  body?: string | null;
  created_at: string;
  inbox_type?: string | null;
  booking_id?: string | null;
  is_flagged?: boolean | null;
  flag_reason?: string | null;
  is_read?: boolean | null;
};

export type UserPreview = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

export function messageText(m: MessageRow): string {
  const c = m.content ?? m.body;
  return typeof c === "string" ? c : "";
}

export function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), {
      addSuffix: true,
      locale: nl,
    });
  } catch {
    return "";
  }
}

export function threadDateLabel(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return "Vandaag";
    if (isYesterday(d)) return "Gisteren";
    return format(d, "d MMMM yyyy", { locale: nl });
  } catch {
    return "";
  }
}

export function initials(name: string, email?: string | null): string {
  const n = name.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean).slice(0, 2);
    const s = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
    if (s) return s;
  }
  if (email && email.length >= 2) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function groupLatestByPartner(
  messages: MessageRow[],
  myId: string,
): Map<string, MessageRow> {
  const sorted = [...messages].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const map = new Map<string, MessageRow>();
  for (const m of sorted) {
    const partner = m.sender_id === myId ? m.recipient_id : m.sender_id;
    if (!map.has(partner)) map.set(partner, m);
  }
  return map;
}
