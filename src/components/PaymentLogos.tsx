import type { ReactNode } from "react";

function LogoWrap({
  children,
  label,
  withBorder = false,
}: {
  children: ReactNode;
  label: string;
  withBorder?: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center justify-center rounded-lg",
        withBorder ? "border border-gray-200 bg-white" : "",
      ].join(" ")}
      title={label}
      aria-label={label}
    >
      {children}
    </div>
  );
}

export function IdealLogo() {
  return (
    <svg viewBox="0 0 64 32" width="64" height="32" aria-hidden>
      <rect width="64" height="32" rx="4" fill="#CC0066" />
      <text
        x="8"
        y="22"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        iDEAL
      </text>
    </svg>
  );
}

export function VisaLogo() {
  return (
    <svg viewBox="0 0 64 32" width="64" height="32" aria-hidden>
      <rect width="64" height="32" rx="4" fill="#1A1F71" />
      <text
        x="8"
        y="22"
        fill="white"
        fontSize="16"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="sans-serif"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo() {
  return (
    <svg viewBox="0 0 64 32" width="64" height="32" aria-hidden>
      <rect width="64" height="32" rx="4" fill="#252525" />
      <circle cx="24" cy="16" r="10" fill="#EB001B" />
      <circle cx="40" cy="16" r="10" fill="#F79E1B" />
      <path
        d="M32 8.4a10 10 0 0 1 0 15.2A10 10 0 0 1 32 8.4z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function PayPalLogo() {
  return (
    <svg viewBox="0 0 64 32" width="64" height="32" aria-hidden>
      <rect width="64" height="32" rx="4" fill="#003087" />
      <text
        x="8"
        y="13"
        fill="#009CDE"
        fontSize="9"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        Pay
      </text>
      <text
        x="8"
        y="24"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        Pal
      </text>
    </svg>
  );
}

export function ApplePayLogo() {
  return (
    <svg viewBox="0 0 80 32" width="80" height="32" aria-hidden>
      <rect width="80" height="32" rx="4" fill="#000000" />
      <text
        x="10"
        y="21"
        fill="white"
        fontSize="12"
        fontFamily="-apple-system,sans-serif"
      >
        {" "}
        Pay
      </text>
    </svg>
  );
}

export function GooglePayLogo() {
  return (
    <svg viewBox="0 0 80 32" width="80" height="32" aria-hidden>
      <rect
        width="80"
        height="32"
        rx="4"
        fill="#ffffff"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
      <text x="8" y="21" fontSize="12" fontFamily="sans-serif">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#34A853">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#EA4335">g</tspan>
        <tspan fill="#4285F4">le</tspan>
        <tspan fill="#5F6368"> Pay</tspan>
      </text>
    </svg>
  );
}

export function PaymentLogosRow({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const onDark = variant === "dark";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoWrap label="iDEAL">
        <IdealLogo />
      </LogoWrap>
      <LogoWrap label="Visa">
        <VisaLogo />
      </LogoWrap>
      <LogoWrap label="Mastercard">
        <MastercardLogo />
      </LogoWrap>
      <LogoWrap label="PayPal">
        <PayPalLogo />
      </LogoWrap>
      <LogoWrap label="Apple Pay">
        <ApplePayLogo />
      </LogoWrap>
      <LogoWrap label="Google Pay" withBorder={!onDark}>
        <GooglePayLogo />
      </LogoWrap>
    </div>
  );
}

