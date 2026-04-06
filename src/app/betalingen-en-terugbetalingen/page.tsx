import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Betalingen en terugbetalingen — bookadj",
  description:
    "Hoe betalen werkt op bookadj en wanneer je recht hebt op (deel)terugbetaling.",
};

export default function BetalingenTerugbetalingenPage() {
  return (
    <MarketingPageShell maxWidth="prose">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Beleid
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Betalingen en terugbetalingen
      </h1>
      <p className="mt-4 text-neutral-600">
        Op deze pagina lees je in het kort hoe betalingen verlopen en welke
        regels we hanteren voor terugbetaling bij annulering door jou als
        klant. Exacte afspraken kunnen per boeking verschillen; bij twijfel
        verwijzen we naar je bevestiging en de{" "}
        <Link href="/algemene-voorwaarden" className="font-semibold underline">
          algemene voorwaarden
        </Link>
        .
      </p>

      <section className="mt-12 border-t border-neutral-200 pt-10">
        <h2 className="text-xl font-bold text-neutral-900">
          Hoe betalen werkt
        </h2>
        <div className="mt-4 space-y-4 text-neutral-600">
          <p>
            Betalingen verlopen via <strong>Stripe</strong>. Je kunt onder meer
            gebruikmaken van betaalmethoden zoals iDEAL en creditcard (Visa,
            Mastercard), afhankelijk van wat Stripe op dat moment aanbiedt.
          </p>
          <p>
            In de regel wordt je betaalmethode pas belast wanneer de DJ je
            boeking heeft <strong>geaccepteerd</strong>. Zo betaal je niet voor
            een aanvraag die wordt afgewezen.
          </p>
          <p>
            Het platform houdt een deel van het bedrag in voor
            servicekosten en uitbetaling aan de DJ volgens de afspraken in je
            boeking en de voorwaarden.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-neutral-200 pt-10">
        <h2 className="text-xl font-bold text-neutral-900">
          Terugbetalingsbeleid (indicatie annulering klant)
        </h2>
        <p className="mt-4 text-neutral-600">
          Onderstaande termijnen zijn een <strong>richtlijn</strong> ten
          opzichte van de datum van je evenement. Afwijkingen zijn mogelijk als
          dat in je boeking of in de voorwaarden staat.
        </p>
        <ul className="mt-6 space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-neutral-800">
          <li>
            <strong className="text-neutral-900">Meer dan 30 dagen</strong> voor
            de evenementdatum: in principe <strong>volledige terugbetaling</strong>{" "}
            van het door jou betaalde boekingsbedrag (exclusief eventuele
            niet-restitueerbare kosten zoals vermeld bij de boeking).
          </li>
          <li>
            <strong className="text-neutral-900">Tussen 14 en 30 dagen</strong>{" "}
            voor de evenementdatum: <strong>gedeeltelijke terugbetaling</strong>
            — een deel van het bedrag kan ingehouden worden voor
            gemaakte kosten en de gereserveerde tijd van de DJ.
          </li>
          <li>
            <strong className="text-neutral-900">Minder dan 14 dagen</strong>{" "}
            voor de evenementdatum: in principe <strong>geen terugbetaling</strong>
            , omdat de DJ en planning dan vaak volledig zijn ingezet. Uitzondering
            bij overmacht of in overleg met support.
          </li>
        </ul>
      </section>

      <section className="mt-12 border-t border-neutral-200 pt-10">
        <h2 className="text-xl font-bold text-neutral-900">
          Hoe vraag je een terugbetaling aan?
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-neutral-600">
          <li>
            Log in en open je boeking in het dashboard, of neem contact op via{" "}
            <Link href="/contact" className="font-semibold underline">
              het contactformulier
            </Link>{" "}
            met je referentie.
          </li>
          <li>
            Vermeld duidelijk de reden (bijv. annulering, no-show, andere
            partij).
          </li>
          <li>
            Ons team beoordeelt je verzoek binnen een redelijke termijn en
            laat weten of terugbetaling mogelijk is volgens het beleid.
          </li>
        </ol>
        <p className="mt-6 text-sm text-neutral-500">
          Voor geschillen tussen klant en DJ: zie{" "}
          <Link href="/geschillen" className="font-semibold text-neutral-700 underline">
            Hulp bij problemen
          </Link>
          .
        </p>
      </section>
    </MarketingPageShell>
  );
}
