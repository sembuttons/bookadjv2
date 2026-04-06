/** Returns YouTube embed path (11-char id) or Vimeo numeric id, or null. */
export function parseVideoEmbed(url: string): { type: "youtube"; id: string } | { type: "vimeo"; id: string } | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? { type: "youtube", id } : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return { type: "youtube", id: v };
      const m = u.pathname.match(/^\/embed\/([\w-]{11})/);
      if (m) return { type: "youtube", id: m[1] };
      const m2 = u.pathname.match(/^\/shorts\/([\w-]{11})/);
      if (m2) return { type: "youtube", id: m2[1] };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m) return { type: "vimeo", id: m[1] };
    }
  } catch {
    return null;
  }
  return null;
}

export function videoEmbedSrc(url: string): string | null {
  const p = parseVideoEmbed(url);
  if (!p) return null;
  if (p.type === "youtube") return `https://www.youtube-nocookie.com/embed/${p.id}`;
  return `https://player.vimeo.com/video/${p.id}`;
}
