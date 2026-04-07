export function IdealLogo() {
  return (
    <svg
      width="60"
      height="36"
      viewBox="0 0 60 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="60" height="36" rx="6" fill="#CC0066" />
      <text
        x="10"
        y="24"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        iD
      </text>
      <text
        x="28"
        y="24"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fontWeight="bold"
        fill="white"
      >
        EAL
      </text>
    </svg>
  );
}

export function VisaLogo() {
  return (
    <svg width="60" height="36" viewBox="0 0 60 36" fill="none" aria-hidden>
      <rect width="60" height="36" rx="6" fill="#1A1F71" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fontWeight="900"
        fontStyle="italic"
        fill="white"
        letterSpacing="-1"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo() {
  return (
    <svg width="60" height="36" viewBox="0 0 60 36" fill="none" aria-hidden>
      <rect width="60" height="36" rx="6" fill="#252525" />
      <circle cx="22" cy="18" r="11" fill="#EB001B" />
      <circle cx="38" cy="18" r="11" fill="#F79E1B" />
      <path d="M30 9.5a11 11 0 0 1 0 17A11 11 0 0 1 30 9.5z" fill="#FF5F00" />
    </svg>
  );
}

export function PayPalLogo() {
  return (
    <svg width="60" height="36" viewBox="0 0 60 36" fill="none" aria-hidden>
      <rect width="60" height="36" rx="6" fill="#003087" />
      <text
        x="50%"
        y="44%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#009CDE"
      >
        Pay
      </text>
      <text
        x="50%"
        y="68%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="white"
      >
        Pal
      </text>
    </svg>
  );
}

export function ApplePayLogo() {
  return (
    <svg width="72" height="36" viewBox="0 0 72 36" fill="none" aria-hidden>
      <rect width="72" height="36" rx="6" fill="#000000" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="13"
        fill="white"
      >
        {" "}
        Pay
      </text>
    </svg>
  );
}

export function GooglePayLogo() {
  return (
    <svg width="72" height="36" viewBox="0 0 72 36" fill="none" aria-hidden>
      <rect
        width="72"
        height="36"
        rx="6"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12"
      >
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#34A853">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#EA4335">g</tspan>
        <tspan fill="#4285F4">le </tspan>
        <tspan fill="#5F6368">Pay</tspan>
      </text>
    </svg>
  );
}

export function PaymentLogosRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <IdealLogo />
      <VisaLogo />
      <MastercardLogo />
      <PayPalLogo />
      <ApplePayLogo />
      <GooglePayLogo />
    </div>
  );
}

