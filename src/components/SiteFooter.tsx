import Link from "next/link";

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6.5 8.5H3V21h3.5V8.5zM4.75 3.5a2 1.75 0 100 3.5 2 1.75 0 000-3.5zM21 21h-3.5v-5.75c0-1.37-.5-2.3-1.72-2.3-.94 0-1.5.63-1.75 1.24-.09.22-.11.53-.11.84V21H10.5s.05-9.73 0-10.73H14v1.53c.47-.72 1.3-1.75 3.17-1.75 2.3 0 4.03 1.5 4.03 4.73V21z" />
    </svg>
  );
}

function IconVisa({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="44"
      height="28"
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
      width="44"
      height="28"
      viewBox="0 0 44 28"
      aria-hidden
    >
      <rect width="44" height="28" rx="4" fill="#F7F7F7" stroke="#E5E5E5" />
      <circle cx="18" cy="14" r="7" fill="#EB001B" />
      <circle cx="26" cy="14" r="7" fill="#F79E1B" />
      <path
        d="M22 8.2a7 7 0 010 11.6 7 7 0 000-11.6z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function IdealBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-7 min-w-[52px] items-center justify-center rounded border border-neutral-200 bg-white px-2 text-[10px] font-bold tracking-tight text-[#CC0066] ${className ?? ""}`}
      aria-hidden
    >
      iDEAL
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_2fr] lg:gap-16">
          <div>
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-neutral-900"
            >
              bookadj
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
              De DJ boekingsmarktplaats van Nederland
            </p>
            <div className="mt-6 flex items-center gap-4 text-neutral-600">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-neutral-900"
                aria-label="Instagram"
              >
                <IconInstagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-neutral-900"
                aria-label="LinkedIn"
              >
                <IconLinkedIn className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Platform</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link href="/zoeken" className="hover:text-neutral-900">
                    DJ&apos;s vinden
                  </Link>
                </li>
                <li>
                  <Link href="/hoe-het-werkt" className="hover:text-neutral-900">
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link href="/voor-djs" className="hover:text-neutral-900">
                    Voor DJ&apos;s
                  </Link>
                </li>
                <li>
                  <Link href="/prijzen" className="hover:text-neutral-900">
                    Prijzen
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Support</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link href="/veelgestelde-vragen" className="hover:text-neutral-900">
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-neutral-900">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/geschillen" className="hover:text-neutral-900">
                    Geschillen
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-neutral-900">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Juridisch</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>
                  <Link href="/voorwaarden" className="hover:text-neutral-900">
                    Algemene voorwaarden
                  </Link>
                </li>
                <li>
                  <Link href="/privacybeleid" className="hover:text-neutral-900">
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-neutral-900">
                    Cookiebeleid
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 bg-neutral-50/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-neutral-500">
            © 2026 bookadj. Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">
              Betaalmethoden
            </span>
            <span className="flex items-center gap-2" aria-label="Visa, Mastercard, iDEAL">
              <IconVisa className="h-7 w-auto" />
              <IconMastercard className="h-7 w-auto" />
              <IdealBadge />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
