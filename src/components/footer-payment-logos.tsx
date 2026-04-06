import type { ReactNode } from "react";

/** ~40×24 mark-style badges for footer; subtle border on wrapper via className */

function LogoShell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <li
      className="flex h-[26px] w-[42px] shrink-0 items-center justify-center rounded border border-neutral-400/35 bg-white/[0.06] px-0.5 py-0.5"
      title={label}
    >
      <span className="sr-only">{label}</span>
      {children}
    </li>
  );
}

export function IdealLogoMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <circle cx="20" cy="12" r="10" fill="#6B2D7B" />
      <text
        x="20"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        iD
      </text>
    </svg>
  );
}

export function VisaLogoMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <rect width="40" height="24" rx="3" fill="#1A1F71" />
      <text
        x="20"
        y="16.5"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontStyle="italic"
        fontFamily="Arial, system-ui, sans-serif"
        letterSpacing="0.08em"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogoMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <rect width="40" height="24" rx="3" fill="#F7F7F7" />
      <circle cx="16" cy="12" r="7" fill="#EB001B" />
      <circle cx="24" cy="12" r="7" fill="#F79E1B" />
      <path
        d="M20 6.2a7 7 0 010 11.6 7 7 0 000-11.6z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function PayPalLogoMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <rect width="40" height="24" rx="3" fill="#F5F5F5" />
      <text x="4" y="15" fill="#003087" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
        Pay
      </text>
      <text x="22" y="15" fill="#009CDE" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
        Pal
      </text>
    </svg>
  );
}

export function ApplePayLogoMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <rect width="40" height="24" rx="3" fill="#000000" />
      <path
        fill="white"
        d="M8.2 8.1c.35 0 .9-.4 1.5-.4.8 0 1.1.45 1.1.45-.55.35-.95 1-.95 1.75 0 .85.5 1.55 1.15 1.85-.2.55-.55 1.4-1.35 1.4-.5 0-.85-.3-1.35-.3-.5 0-.85.3-1.35.3-.8 0-1.2-.9-1.4-1.45.65-.3 1.1-.95 1.1-1.65 0-.75-.45-1.35-.95-1.7zm1.65-2.35c.45-.55 1.15-.95 1.85-.95.1.75-.25 1.45-.7 1.9-.45.5-1.2.85-1.9.75-.05-.75.3-1.45.75-1.7z"
      />
      <text
        x="26"
        y="15.5"
        textAnchor="middle"
        fill="white"
        fontSize="7"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        Pay
      </text>
    </svg>
  );
}

export function GooglePayLogoMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <rect width="40" height="24" rx="3" fill="#FFFFFF" />
      <path
        d="M10.5 12.2c0-.5.08-1 .25-1.4H7.8v2.65h1.5a2.2 2.2 0 01-.95 1.45v1.2h1.55c.9-.85 1.4-2.1 1.4-3.9z"
        fill="#4285F4"
      />
      <path
        d="M7.8 17.5c1.25 0 2.3-.4 3.1-1.1l-1.55-1.2c-.4.28-.95.45-1.55.45-1.2 0-2.2-.8-2.55-1.9H3.65v1.25c.8 1.55 2.45 2.5 4.15 2.5z"
        fill="#34A853"
      />
      <path
        d="M5.25 13.75a3.7 3.7 0 010-2.4V10.1H3.65a6 6 0 000 5.4l1.6-1.25z"
        fill="#FBBC05"
      />
      <path
        d="M7.8 9.45c.65 0 1.25.22 1.7.65l1.3-1.3c-.8-.75-1.85-1.2-3-1.2-1.7 0-3.35.95-4.15 2.5l1.6 1.25c.35-1.1 1.35-1.9 2.55-1.9z"
        fill="#EA4335"
      />
      <text x="22" y="15.5" fill="#5F6368" fontSize="7" fontWeight="600" fontFamily="system-ui, sans-serif">
        Pay
      </text>
    </svg>
  );
}

export function FooterPaymentLogos() {
  return (
    <ul
      className="flex flex-wrap items-center gap-[8px]"
      aria-label="Geaccepteerde betaalmethoden"
    >
      <LogoShell label="iDEAL">
        <IdealLogoMark />
      </LogoShell>
      <LogoShell label="Visa">
        <VisaLogoMark />
      </LogoShell>
      <LogoShell label="Mastercard">
        <MastercardLogoMark />
      </LogoShell>
      <LogoShell label="PayPal">
        <PayPalLogoMark />
      </LogoShell>
      <LogoShell label="Apple Pay">
        <ApplePayLogoMark />
      </LogoShell>
      <LogoShell label="Google Pay">
        <GooglePayLogoMark />
      </LogoShell>
    </ul>
  );
}
