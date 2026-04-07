import Link from "next/link";
import { FooterPaymentLogos } from "@/components/footer-payment-logos";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#0a0a0a] text-sm">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              book<span className="text-green-400">adj</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              De DJ-boekingsmarktplaats van Nederland — geverifieerd, transparant,
              veilig betalen.
            </p>
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-600">
                Betaalmethoden
              </p>
              <FooterPaymentLogos />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                Ontdekken
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/zoeken"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    DJ&apos;s vinden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hoe-het-werkt"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Hoe het werkt
                  </Link>
                </li>
                <li>
                  <Link
                    href="/steden"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Steden
                  </Link>
                </li>
                <li>
                  <Link
                    href="/veelgestelde-vragen"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                Voor DJ&apos;s
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/voor-djs"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Aanmelden als DJ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hoe-het-werkt"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Hoe werkt het voor DJ&apos;s
                  </Link>
                </li>
                <li>
                  <Link
                    href="/voor-djs#verificatie"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    DJ verificatie
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                Bedrijf
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/over-ons"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/geschillen"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Hulp bij problemen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-gray-500 transition-colors hover:text-green-400"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
              Juridisch
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 transition-colors hover:text-green-400"
                >
                  Privacy beleid
                </Link>
              </li>
              <li>
                <Link
                  href="/algemene-voorwaarden"
                  className="text-sm text-gray-500 transition-colors hover:text-green-400"
                >
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link
                  href="/cookiebeleid"
                  className="text-sm text-gray-500 transition-colors hover:text-green-400"
                >
                  Cookiebeleid
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-gray-600">
            © 2026 bookadj. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-gray-600">KVK: [nog in te vullen]</p>
        </div>
      </div>
    </footer>
  );
}
