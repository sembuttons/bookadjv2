export const SUSPICIOUS_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /(\+31|0031|06)[\s\-]?[0-9]{8}/,
    reason: "telefoonnummer gedetecteerd",
  },
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    reason: "e-mailadres gedetecteerd",
  },
  {
    pattern: /tikkie|paypal|revolut|betaalverzoek|bankoverschrijving/i,
    reason: "externe betaling gedetecteerd",
  },
  {
    pattern: /\biban\b|NL\d{2}[A-Z]{4}\d{10}/i,
    reason: "bankrekeningnummer gedetecteerd",
  },
  {
    pattern: /whatsapp|telegram|snapchat|tiktok/i,
    reason: "externe communicatie gedetecteerd",
  },
  {
    pattern: /instagram\.com|facebook\.com/i,
    reason: "externe link gedetecteerd",
  },
  {
    pattern: /buiten het platform|rechtstreeks betalen|direct overmaken/i,
    reason: "off-platform verzoek gedetecteerd",
  },
];

const REDACT = "[Contactgegevens verborgen]";

export function analyzeMessageContent(content: string): {
  isFlagged: boolean;
  flagReason: string | null;
  displayContent: string;
} {
  const match = SUSPICIOUS_PATTERNS.find((p) => p.pattern.test(content));
  const isFlagged = Boolean(match);
  const flagReason = match?.reason ?? null;
  let displayContent = content;
  if (isFlagged) {
    for (const { pattern } of SUSPICIOUS_PATTERNS) {
      displayContent = displayContent.replace(pattern, REDACT);
    }
  }
  return { isFlagged, flagReason, displayContent };
}

export function warningForPriorOffenses(priorOffenseCount: number): string {
  if (priorOffenseCount === 0) {
    return "Waarschuwing: Het delen van contactgegevens of betalingen buiten bookadj is niet toegestaan en kan leiden tot verlies van betalingsbescherming en accountopschorting.";
  }
  if (priorOffenseCount === 1) {
    return "Tweede overtreding gedetecteerd. Bij een derde overtreding wordt je account automatisch opgeschort.";
  }
  return "Je account is opgeschort vanwege herhaalde overtredingen.";
}
