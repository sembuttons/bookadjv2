import Link from "next/link";
import { FooterPaymentLogos } from "@/components/footer-payment-logos";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface text-sm text-ink-secondary">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left: brand + payments */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-ink transition-colors hover:text-bookadj-soft"
            >
              bookadj
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-secondary">
              De DJ-boekingsmarktplaats van Nederland — geverifieerd, transparant,
              veilig betalen.
            </p>
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Betaalmethoden
              </p>
              <FooterPaymentLogos />
            </div>
          </div>

          {/* Middle: nav groups */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Ontdekken
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/zoeken"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    DJ&apos;s vinden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hoe-het-werkt"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/steden"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Steden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/veelgestelde-vragen"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Voor DJ&apos;s
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/voor-djs"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Aanmelden als DJ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hoe-het-werkt"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Hoe werkt het voor DJ&apos;s
                  </Link>
                </li>
                <li>
                  <Link
                    href="/voor-djs#verificatie"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    DJ verificatie
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Bedrijf
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/over-ons"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/geschillen"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Hulp bij problemen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-ink-secondary transition-all duration-200 hover:text-ink"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: legal */}
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">
              Juridisch
            </p>
            <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Privacy beleid
                  </Link>
                </li>
                <li>
                  <Link
                    href="/algemene-voorwaarden"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Algemene voorwaarden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookiebeleid"
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    Cookiebeleid
                  </Link>
                </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-ink-muted">
            © 2026 bookadj. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-ink-muted">KVK: [nog in te vullen]</p>
        </div>
      </div>
    </footer>
  );
}
