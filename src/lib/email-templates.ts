const BRAND = {
  green: "#22c55e",
  bg: "#ffffff",
  dark: "#0a0a0a",
  text: "#374151",
  muted: "#6b7280",
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  if (!raw) return "https://bookadj.nl";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

function absolute(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl()}${p}`;
}

function button(href: string, label: string): string {
  return `
    <a href="${escapeHtml(href)}"
       style="display:inline-block;background:${BRAND.green};color:#0a0a0a;text-decoration:none;font-weight:700;
              padding:12px 18px;border-radius:12px;font-size:14px;line-height:1;">
      ${escapeHtml(label)}
    </a>
  `;
}

function box(rows: Array<{ label: string; value: string }>): string {
  return `
    <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;">
      ${rows
        .map(
          (r) => `
            <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;">
              <div style="color:${BRAND.muted};font-size:13px;line-height:1.35;">${escapeHtml(r.label)}</div>
              <div style="color:${BRAND.text};font-size:13px;line-height:1.35;font-weight:600;text-align:right;">${escapeHtml(
                r.value,
              )}</div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function wrapEmailHtml(params: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}): string {
  const preheader = params.preheader?.trim() || "";
  const unsubscribeUrl = absolute("/unsubscribe");
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(params.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="background:${BRAND.dark};padding:18px 22px;border-radius:16px 16px 0 0;">
                <div style="font-size:18px;font-weight:800;letter-spacing:-0.2px;color:#ffffff;">
                  book<span style="color:${BRAND.green};">adj</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;padding:22px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                ${params.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND.dark};padding:18px 22px;border-radius:0 0 16px 16px;">
                <div style="color:#ffffff;font-weight:800;font-size:14px;">
                  book<span style="color:${BRAND.green};">adj</span>
                </div>
                <div style="margin-top:6px;color:#9ca3af;font-size:12px;line-height:1.5;">
                  De DJ-boekingsmarktplaats van Nederland
                </div>
                <div style="margin-top:10px;">
                  <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9ca3af;font-size:12px;text-decoration:underline;">
                    Unsubscribe
                  </a>
                  <span style="color:#4b5563;font-size:12px;"> · </span>
                  <span style="color:#6b7280;font-size:12px;">© ${year} bookadj</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function welcomeEmail(name: string): string {
  const safeName = escapeHtml(name || "");
  return wrapEmailHtml({
    title: "Welkom bij bookadj",
    preheader: "Je account is aangemaakt — je kunt direct DJ’s zoeken.",
    bodyHtml: `
      <h1 style="margin:0 0 10px;color:${BRAND.dark};font-size:24px;line-height:1.25;font-weight:800;">
        Welkom bij bookadj
      </h1>
      <p style="margin:0 0 14px;color:${BRAND.text};font-size:14px;line-height:1.7;">
        ${safeName ? `Hoi ${safeName}, ` : ""}je account is aangemaakt. Je kunt nu DJ&apos;s zoeken,
        boekingen plaatsen en veilig betalen via ons platform.
      </p>
      <div style="margin:18px 0 14px;">
        ${button(absolute("/zoeken"), "Bekijk DJ's")}
      </div>
      <p style="margin:14px 0 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
        Vragen? Mail ons op <a href="mailto:hallo@bookadj.nl" style="color:${BRAND.green};text-decoration:underline;">hallo@bookadj.nl</a>
      </p>
    `,
  });
}

export function bookingReceivedEmail(params: {
  date: string;
  location: string;
  hours: number | string;
  totalAmountEuro: string;
}): string {
  return wrapEmailHtml({
    title: "Nieuwe boekingsaanvraag",
    preheader: "Nieuwe aanvraag — je hebt 24 uur om te reageren.",
    bodyHtml: `
      <h1 style="margin:0 0 10px;color:${BRAND.dark};font-size:22px;line-height:1.25;font-weight:800;">
        Je hebt een nieuwe boekingsaanvraag
      </h1>
      <div style="margin:14px 0;">
        ${box([
          { label: "Datum", value: params.date },
          { label: "Locatie", value: params.location },
          { label: "Aantal uren", value: String(params.hours) },
          { label: "Totaalbedrag", value: `€${params.totalAmountEuro}` },
        ])}
      </div>
      <div style="margin:18px 0 12px;">
        ${button(absolute("/dashboard/dj"), "Bekijk aanvraag")}
      </div>
      <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
        Je hebt 24 uur om te reageren.
      </p>
    `,
  });
}

export function bookingConfirmedEmail(params: {
  djName: string;
  date: string;
  location: string;
  totalAmountEuro: string;
}): string {
  return wrapEmailHtml({
    title: "Boeking bevestigd",
    preheader: "Goed nieuws — je boeking is bevestigd.",
    bodyHtml: `
      <h1 style="margin:0 0 10px;color:${BRAND.dark};font-size:22px;line-height:1.25;font-weight:800;">
        Goed nieuws — je boeking is bevestigd
      </h1>
      <div style="margin:12px 0 14px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:${BRAND.green};color:#0a0a0a;font-weight:900;font-size:16px;">
          ✓
        </span>
      </div>
      <div style="margin:14px 0;">
        ${box([
          { label: "DJ", value: params.djName },
          { label: "Datum", value: params.date },
          { label: "Locatie", value: params.location },
          { label: "Totaal", value: `€${params.totalAmountEuro}` },
        ])}
      </div>
      <div style="margin:18px 0 12px;">
        ${button(absolute("/dashboard/klant"), "Bekijk je boeking")}
      </div>
      <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
        De betaling wordt vastgehouden tot na het event.
      </p>
    `,
  });
}

export function bookingRejectedEmail(params: {
  djName?: string;
}): string {
  return wrapEmailHtml({
    title: "Update over je boekingsaanvraag",
    preheader: "Je betaling wordt niet in rekening gebracht.",
    bodyHtml: `
      <h1 style="margin:0 0 10px;color:${BRAND.dark};font-size:22px;line-height:1.25;font-weight:800;">
        Je aanvraag is helaas niet geaccepteerd
      </h1>
      <p style="margin:0 0 14px;color:${BRAND.text};font-size:14px;line-height:1.7;">
        ${params.djName ? `${escapeHtml(params.djName)} is niet beschikbaar voor jouw datum. ` : ""}
        Je betaling wordt niet in rekening gebracht.
      </p>
      <div style="margin:18px 0 0;">
        ${button(absolute("/zoeken"), "Zoek een andere DJ")}
      </div>
    `,
  });
}

export function reviewRequestEmail(params: {
  djName: string;
  bookingId: string;
}): string {
  const hrefBase = absolute(`/reviews/${encodeURIComponent(params.bookingId)}`);
  const stars = Array.from({ length: 5 }, (_, i) => {
    const rating = i + 1;
    return `<a href="${escapeHtml(`${hrefBase}?rating=${rating}`)}" style="text-decoration:none;color:#d1d5db;font-size:18px;line-height:1;margin-right:2px;">★</a>`;
  }).join("");

  return wrapEmailHtml({
    title: "Deel je ervaring",
    preheader: `Hoe was je ervaring met ${params.djName}?`,
    bodyHtml: `
      <h1 style="margin:0 0 10px;color:${BRAND.dark};font-size:22px;line-height:1.25;font-weight:800;">
        Deel je ervaring
      </h1>
      <p style="margin:0 0 14px;color:${BRAND.text};font-size:14px;line-height:1.7;">
        Je event is voorbij — we hopen dat het geweldig was! Laat een review achter en help andere boekers.
      </p>
      <div style="margin:12px 0 16px;">
        ${stars}
      </div>
      <div style="margin:18px 0 0;">
        ${button(hrefBase, "Schrijf een review")}
      </div>
    `,
  });
}

export function newMessageEmail(params: {
  name: string;
  preview: string;
  userId: string;
}): string {
  const safePreview = escapeHtml(params.preview);
  const threadUrl = absolute(`/berichten/${encodeURIComponent(params.userId)}`);
  return wrapEmailHtml({
    title: "Nieuw bericht",
    preheader: `Nieuw bericht van ${params.name}`,
    bodyHtml: `
      <h1 style="margin:0 0 10px;color:${BRAND.dark};font-size:22px;line-height:1.25;font-weight:800;">
        Je hebt een nieuw bericht
      </h1>
      <div style="margin:14px 0;">
        <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;color:${BRAND.text};font-size:14px;line-height:1.7;font-style:italic;">
          “${safePreview}...”
        </div>
      </div>
      <div style="margin:18px 0 12px;">
        ${button(threadUrl, "Beantwoord bericht")}
      </div>
      <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:1.6;">
        Communiceer altijd via bookadj — deel geen persoonlijke contactgegevens.
      </p>
    `,
  });
}

