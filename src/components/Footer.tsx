import Link from "next/link";
import { FooterPaymentLogos } from "@/components/footer-payment-logos";

const footerBg = "#111111";

export function Footer() {
  return (
    <footer
      className="mt-auto text-sm text-white/90"
      style={{ backgroundColor: footerBg }}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left: brand + payments */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white transition-colors hover:text-emerald-300"
            >
              bookadj
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              De DJ-boekingsmarktplaats van Nederland — geverifieerd, transparant,
              veilig betalen.
            </p>
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
                Betaalmethoden
              </p>
              <FooterPaymentLogos />
            </div>
          </div>

          {/* Middle: nav groups */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Ontdekken
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/zoeken"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    DJ&apos;s vinden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hoe-het-werkt"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/steden"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Steden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/veelgestelde-vragen"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Voor DJ&apos;s
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/voor-djs"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Aanmelden als DJ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hoe-het-werkt"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Hoe werkt het voor DJ&apos;s
                  </Link>
                </li>
                <li>
                  <Link
                    href="/voor-djs#verificatie"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    DJ verificatie
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Bedrijf
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/over-ons"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/geschillen"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Hulp bij problemen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-white/70 transition-all duration-200 hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: legal */}
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Juridisch
            </p>
            <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Privacy beleid
                  </Link>
                </li>
                <li>
                  <Link
                    href="/algemene-voorwaarden"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Algemene voorwaarden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookiebeleid"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    Cookiebeleid
                  </Link>
                </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-white/50">
            © 2026 bookadj. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-white/45">KVK: [nog in te vullen]</p>
        </div>
      </div>
    </footer>
  );
}
