/** Resend `from` header when env is a plain address. */
export function getResendFromEmail(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) return "bookadj <info@bookadj.nl>";
  if (raw.includes("<") && raw.includes(">")) return raw;
  return `bookadj <${raw}>`;
}

export function getContactInboxEmail(): string {
  return process.env.CONTACT_INBOX_EMAIL?.trim() || "info@bookadj.nl";
}
