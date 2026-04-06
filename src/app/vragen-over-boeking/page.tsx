import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Vragen over boeken — bookadj",
  description:
    "Antwoorden op veelgestelde vragen over het boeken van een DJ via bookadj.",
};

export default function VragenOverBoekingPage() {
  return (
    <MarketingPageShell maxWidth="wide">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Help
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Vragen over je boeking
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-600">
        Alles over aanvragen, betaling, annulering en wat er gebeurt als er iets
        misgaat. Staat je vraag er niet tussen?{" "}
        <Link href="/contact" className="font-semibold text-neutral-900 underline">
          Neem contact op
        </Link>
        .
      </p>

      <div className="mt-10">
        <FaqAccordion
          items={[
            {
              question: "Hoe werkt een boeking stap voor stap?",
              answer: (
                <>
                  <p>
                    Je zoekt een DJ, vult datum, tijd en locatie in en stuurt een
                    aanvraag. De DJ heeft tijd om te reageren. Pas als de DJ
                    accepteert, wordt je betaalmethode belast (of wordt de
                    betaling voltooid volgens het gekozen schema). Daarna
                    regel je het verder via berichten op het platform.
                  </p>
                </>
              ),
            },
            {
              question: "Wanneer wordt mijn betaling afgeschreven?",
              answer: (
                <p>
                  Bij bookadj betaal je veilig via Stripe. In de regel wordt je
                  kaart of betaalmethode pas belast wanneer de DJ je aanvraag
                  heeft geaccepteerd — zo weet je zeker dat je niet voor niets
                  betaalt. De exacte timing kan per situatie verschillen; je ziet
                  het altijd in je bevestiging en op de betalingspagina.
                </p>
              ),
            },
            {
              question: "Is mijn betaling veilig?",
              answer: (
                <p>
                  Ja. Betalingen lopen via Stripe (o.a. iDEAL, creditcard).
                  Wij slaan geen volledige kaartgegevens op. Communicatie en
                  betalingsbescherming horen bij het platform — betaal niet
                  buiten bookadj om, zodat je beschermd blijft.
                </p>
              ),
            },
            {
              question: "Wat als de DJ mijn evenement annuleert?",
              answer: (
                <p>
                  Dat is vervelend — en precies waarom bookadj tussenbeide staat.
                  We streven ernaar een vervangende DJ voor te stellen of, als
                  dat niet lukt, een volledige terugbetaling te regelen volgens
                  ons beleid. Lees meer op{" "}
                  <Link
                    href="/als-dj-annuleert"
                    className="font-semibold text-neutral-900 underline"
                  >
                    Als een DJ annuleert
                  </Link>
                  .
                </p>
              ),
            },
            {
              question: "Hoe kan ik als klant annuleren?",
              answer: (
                <p>
                  Annuleren kan afhankelijk van hoe lang het nog tot je
                  evenement is en wat er in je boeking staat. Hoe eerder je
                  meldt, hoe meer opties er meestal zijn. Bekijk{" "}
                  <Link
                    href="/betalingen-en-terugbetalingen"
                    className="font-semibold text-neutral-900 underline"
                  >
                    Betalingen en terugbetalingen
                  </Link>{" "}
                  voor de termijnen (30+ dagen, 14–30 dagen, minder dan 14
                  dagen) en neem bij twijfel contact op via het platform.
                </p>
              ),
            },
            {
              question: "Hoe werken reviews na een boeking?",
              answer: (
                <p>
                  Na een afgeronde boeking kun je (als klant) vaak een beoordeling
                  achterlaten. Reviews helpen andere gebruikers en zijn gekoppeld
                  aan echte ervaringen op het platform. Oneerlijke of beledigende
                  inhoud kan worden verwijderd volgens onze richtlijnen.
                </p>
              ),
            },
            {
              question: "Wat als ik het oneens ben met de DJ over geld of afspraken?",
              answer: (
                <p>
                  Probeer eerst in het gesprek op bookadj tot een oplossing te
                  komen. Lukt dat niet, dan kun je ons inschakelen: we kijken
                  mee en bemiddelen waar nodig. Zie{" "}
                  <Link
                    href="/geschillen"
                    className="font-semibold text-neutral-900 underline"
                  >
                    Hulp bij problemen
                  </Link>
                  .
                </p>
              ),
            },
            {
              question: "Waarom moet ik communiceren via bookadj?",
              answer: (
                <p>
                  Zo blijft er een duidelijk spoor van afspraken en ben je
                  beschermd als er iets misgaat met betaling of levering. Het
                  delen van contactgegevens om buiten het platform af te
                  spreken kan je bescherming ondergraven en is niet toegestaan.
                </p>
              ),
            },
          ]}
        />
      </div>
    </MarketingPageShell>
  );
}
