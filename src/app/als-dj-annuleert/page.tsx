import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Als een DJ annuleert — bookadj",
  description:
    "Wat bookadj doet als je DJ niet kan komen: vervanger of terugbetaling.",
};

export default function AlsDjAnnuleertPage() {
  return (
    <MarketingPageShell maxWidth="prose">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Gemoedsrust
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Als je DJ annuleert
      </h1>
      <p className="mt-4 text-lg text-neutral-700">
        Geen zorgen: jouw feest hoeft niet in het water te vallen. bookadj
        staat tussen jou en de DJ — als er iets misgaat aan hun kant, pakken
        wij het met je op.
      </p>

      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950">
        <p className="font-semibold">Samengevat</p>
        <p className="mt-2 text-sm">
          We zoeken waar mogelijk een <strong>passende vervangende DJ</strong>.
          Lukt dat niet tijdig, dan streven we naar een{" "}
          <strong>volledige terugbetaling</strong> van wat je via het platform
          voor deze boeking hebt betaald, conform ons beleid en de voorwaarden.
        </p>
      </div>

      <section className="mt-12 space-y-4 text-neutral-600">
        <h2 className="text-xl font-bold text-neutral-900">
          Wat gebeurt er eerst?
        </h2>
        <p>
          Zodra een DJ een bevestigde boeking annuleert of niet kan nakomen,
          krijg je daar bericht van via het platform (en waar van toepassing
          per e-mail). Je hoeft niet zelf te gokken wat de volgende stap is —
          volg de instructies in je account of neem direct{" "}
          <Link href="/contact" className="font-semibold text-neutral-900 underline">
            contact
          </Link>{" "}
          op.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-neutral-600">
        <h2 className="text-xl font-bold text-neutral-900">
          Stappen die wij zetten
        </h2>
        <ol className="list-decimal space-y-4 pl-5">
          <li>
            <strong className="text-neutral-900">Melding en check</strong> — we
            bevestigen dat de annulering bij de DJ vandaan komt en welke datum
            en locatie van je evenement gelden.
          </li>
          <li>
            <strong className="text-neutral-900">Vervanger zoeken</strong> — we
            kijken binnen ons netwerk of er een andere geverifieerde DJ
            beschikbaar is met vergelijkbaar profiel en budget, in overleg met
            jou.
          </li>
          <li>
            <strong className="text-neutral-900">Terugbetaling als er geen match is</strong>{" "}
            — als er geen geschikte vervanger is binnen de afgesproken termijn,
            starten we het traject voor terugbetaling volgens het beleid.
          </li>
        </ol>
      </section>

      <section className="mt-10 space-y-4 text-neutral-600">
        <h2 className="text-xl font-bold text-neutral-900">
          Jouw rol (minimaal)
        </h2>
        <p>
          Reageer op berichten van ons team, bevestig of een voorgestelde
          vervanger voor jou werkt, en houd je mailbox in de gaten. Hoe sneller
          je reageert, hoe eerder je weer rust hebt.
        </p>
      </section>

      <p className="mt-10 text-sm text-neutral-500">
        Meer over betalingen:{" "}
        <Link
          href="/betalingen-en-terugbetalingen"
          className="font-semibold text-neutral-700 underline"
        >
          Betalingen en terugbetalingen
        </Link>
        .
      </p>
    </MarketingPageShell>
  );
}
