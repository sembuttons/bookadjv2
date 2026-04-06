function IconVisa({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="26"
      viewBox="0 0 44 28"
      aria-hidden
    >
      <rect width="44" height="28" rx="4" fill="#1A1F71" />
      <path
        d="M18.5 19.2l1.4-8.4h2.2l-1.4 8.4h-2.2zm7.8-8.4l-2.1 5.7-.5-2.5c-.3-1-.9-1.7-1.7-2.1l1.9 8.3h-2.1l-3.3-8.4h2.2l.5 1.3 1.1 3.1 1.3-4.4h2.6zm3.5 0c1.8 0 3.1.9 3.1 2.6 0 3.6-4.9 3.8-5.5 5.8h5.3l.6-1.7h-3.3c.2-1.1 2.1-1.2 3-3.1.5-1.1.4-2.6-1.2-2.6h-2z"
        fill="white"
      />
    </svg>
  );
}

function IconMastercard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="26"
      viewBox="0 0 44 28"
      aria-hidden
    >
      <rect width="44" height="28" rx="4" fill="#F7F7F7" stroke="#E5E5E5" />
      <circle cx="18" cy="14" r="7" fill="#EB001B" />
      <circle cx="26" cy="14" r="7" fill="#F79E1B" />
      <path d="M22 8.2a7 7 0 010 11.6 7 7 0 000-11.6z" fill="#FF5F00" />
    </svg>
  );
}

function IdealMark({ className }: { className?: string }) {
  return (
    <span
      className={`text-xs font-bold tracking-tight text-[#CC0066] ${className ?? ""}`}
      aria-hidden
    >
      iDEAL
    </span>
  );
}

function StripeMark({ dark }: { dark?: boolean }) {
  return (
    <span
      className={`text-sm font-semibold tracking-tight ${dark ? "text-[#A78BFA]" : "text-[#635BFF]"}`}
      aria-hidden
    >
      stripe
    </span>
  );
}

type Props = {
  /** Light pills on light bg, or frosted pills on dark footer */
  variant?: "light" | "dark";
  /** Add Stripe next to iDEAL / cards */
  showStripe?: boolean;
  className?: string;
};

export function PaymentMethodBadges({
  variant = "light",
  showStripe = false,
  className = "",
}: Props) {
  const pill =
    variant === "dark"
      ? "rounded-full border border-white/12 bg-[#111827]/[0.07] px-3.5 py-2 shadow-sm backdrop-blur-sm"
      : "rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm";

  return (
    <ul
      className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}
      role="list"
      aria-label="Geaccepteerde betaalmethoden"
    >
      <li>
        <div className={`inline-flex items-center justify-center ${pill}`}>
          <IconVisa className="h-6 w-auto" />
        </div>
      </li>
      <li>
        <div className={`inline-flex items-center justify-center ${pill}`}>
          <IconMastercard className="h-6 w-auto" />
        </div>
      </li>
      <li>
        <div
          className={`inline-flex min-h-[38px] min-w-[80px] items-center justify-center ${pill}`}
        >
          <IdealMark />
        </div>
      </li>
      {showStripe ? (
        <li>
          <div
            className={`inline-flex min-h-[38px] min-w-[72px] items-center justify-center ${pill}`}
          >
            <StripeMark dark={variant === "dark"} />
          </div>
        </li>
      ) : null}
    </ul>
  );
}
