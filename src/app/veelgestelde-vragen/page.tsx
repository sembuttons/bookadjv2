import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Veelgestelde vragen — bookadj",
  description: "FAQ voor klanten en DJ's over bookadj.",
};

export default function VeelgesteldeVragenPage() {
  return (
    <MarketingPageShell maxWidth="wide">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
        FAQ
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Veelgestelde vragen
      </h1>
      <p className="mt-4 text-slate-600">
        Voor specifieke vragen over boeken, zie ook{" "}
        <Link
          href="/vragen-over-boeking"
          className="font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
        >
          Vragen over boeking
        </Link>
        .
      </p>

      <div className="mt-10">
        <FaqAccordion
          items={[
            {
              question: "Wat is bookadj?",
              answer: (
                <p>
                  bookadj is een platform waar je geverifieerde DJ&apos;s kunt
                  vinden, vergelijken en boeken — met duidelijke prijzen en
                  betaling via het platform.
                </p>
              ),
            },
            {
              question: "Hoe maak ik een account als klant?",
              answer: (
                <p>
                  Klik op Aanmelden, kies voor klant en voltooi je gegevens. Daarna
                  kun je direct zoeken en aanvragen sturen.
                </p>
              ),
            },
            {
              question: "Kan ik onderhandelen over de prijs?",
              answer: (
                <p>
                  Het uurtarief staat op het profiel; sommige DJ&apos;s zijn
                  open voor maatwerk via berichten. Blijf communiceren via
                  bookadj zodat afspraken traceerbaar blijven.
                </p>
              ),
            },
            {
              question: "Hoe weet ik of een DJ betrouwbaar is?",
              answer: (
                <p>
                  Geverifieerde DJ&apos;s hebben een controle doorlopen. Daarnaast
                  zie je reviews en duidelijke profielinformatie. Twijfel je?
                  Stel eerst een vraag via het berichtensysteem.
                </p>
              ),
            },
            {
              question: "Wat kost bookadj voor mij als klant?",
              answer: (
                <p>
                  Je ziet het totaalbedrag bij de boeking. Platformkosten kunnen
                  in het tarief verwerkt zijn; details staan bij je bevestiging en
                  in de voorwaarden.
                </p>
              ),
            },
            {
              question: "Hoe meld ik me als DJ?",
              answer: (
                <p>
                  Ga naar Voor DJ&apos;s of meld je aan met rol DJ. Je vult je
                  profiel in en doorloopt verificatie. Pas na goedkeuring word
                  je zichtbaar voor klanten.
                </p>
              ),
            },
            {
              question: "Wanneer word ik als DJ uitbetaald?",
              answer: (
                <p>
                  Uitbetalingen lopen via Stripe Connect volgens de afspraken in
                  je dashboard en de voorwaarden. Typisch na voltooide of
                  bevestigde opdrachten, minus platformfee.
                </p>
              ),
            },
            {
              question: "Mag ik met klanten bellen of Whatsappen?",
              answer: (
                <p>
                  Nee — houd contact binnen bookadj. Zo blijf je beschermd en
                  voorkom je dat boekingen of geschillen buiten het platform
                  vallen.
                </p>
              ),
            },
            {
              question: "Wat als een klant niet betaalt?",
              answer: (
                <p>
                  Betaling verloopt via het platform. Als er iets vastloopt,
                  neem contact op met support; wij kijken mee met de status van
                  de boeking en de betaling.
                </p>
              ),
            },
            {
              question: "Kan ik mijn DJ-profiel aanpassen?",
              answer: (
                <p>
                  Ja, via je dashboard onder profiel. Wijzigingen aan
                  zakelijke gegevens kunnen opnieuw gecontroleerd worden.
                </p>
              ),
            },
            {
              question: "Hoe annuleer ik mijn account?",
              answer: (
                <p>
                  Neem contact op via het{" "}
                  <Link href="/contact" className="font-semibold underline">
                    contactformulier
                  </Link>
                  . We verwerken verwijderverzoeken conform privacybeleid en
                  wettelijke bewaartermijnen.
                </p>
              ),
            },
            {
              question: "Waar meld ik een technisch probleem?",
              answer: (
                <p>
                  Gebruik het contactformulier met onderwerp &quot;Technisch
                  probleem&quot; en beschrijf wat je ziet (browser, schermfoto
                  helpt).
                </p>
              ),
            },
          ]}
        />
      </div>
    </MarketingPageShell>
  );
}
