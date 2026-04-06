import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Algemene voorwaarden — bookadj",
  description: "Gebruiksvoorwaarden van het bookadj-platform.",
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <MarketingPageShell maxWidth="prose">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
        Juridisch
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Algemene voorwaarden
      </h1>
      <p className="mt-4 text-sm text-gray-500">
        Laatst bijgewerkt: april 2026
      </p>

      <div className="prose-bookadj mt-10 max-w-none">
        <h2>1. Toepasselijkheid</h2>
        <p>
          Deze algemene voorwaarden gelden voor het gebruik van het platform
          bookadj en alle diensten die wij daarbij aanbieden. Door een account aan
          te maken of het platform te gebruiken, ga je akkoord met deze voorwaarden.
        </p>

        <h2>2. Het platform</h2>
        <p>
          bookadj is een online marktplaats: wij brengen klanten en DJ&apos;s
          samen en faciliteren communicatie en betaling. bookadj is geen partij
          bij de uitvoering van de opdracht tussen klant en DJ, tenzij uitdrukkelijk
          anders vermeld. De overeenkomst voor de prestatie (het optreden) komt
          tot stand tussen klant en DJ; bookadj ondersteunt het proces.
        </p>

        <h2>3. Accounts en gedrag</h2>
        <p>
          Je verstrekt juiste gegevens en houdt je inlog veilig. Het is niet
          toegestaan om het platform te gebruiken voor illegale activiteiten,
          misleiding, intimidatie of om betalingen of communicatie buiten het
          platform te leiden om commissies of bescherming te omzeilen. Wij kunnen
          accounts schorsen of beëindigen bij overtreding.
        </p>

        <h2>4. Boekingsvoorwaarden</h2>
        <p>
          Een boeking ontstaat wanneer partijen akkoord zijn volgens de flow op
          het platform. Afspraken over tijd, locatie, repertoire en aanvullende
          voorwaarden leggen klant en DJ vast via de platformcommunicatie. Wij
          raden aan alles schriftelijk via bookadj te bevestigen.
        </p>
        <p>
          Annulering en wijzigingen volgen het beleid zoals beschreven op de
          pagina&apos;s{" "}
          <Link href="/betalingen-en-terugbetalingen">
            Betalingen en terugbetalingen
          </Link>{" "}
          en{" "}
          <Link href="/als-dj-annuleert">Als een DJ annuleert</Link>.
        </p>

        <h2>5. Betalingen</h2>
        <p>
          Betalingen verlopen via onze betaalpartner. Door te betalen via het
          platform profiteer je van de afgesproken beschermings- en
          uitbetalingsflows. Directe betalingen buiten het platform vallen buiten
          onze tussenkomst en zijn voor eigen risico.
        </p>

        <h2>6. Commissies en tarieven</h2>
        <p>
          Voor DJ&apos;s kunnen platformkosten of commissies van toepassing zijn,
          zoals weergegeven in het dashboard en bij acceptatie van voorwaarden.
          Voor klanten kan het getoonde tarief inclusief of exclusief
          platformkosten zijn; het totaal bij checkout is leidend.
        </p>

        <h2>7. Aansprakelijkheid</h2>
        <p>
          Wij streven naar een betrouwbaar platform maar kunnen niet garanderen
          dat het altijd foutloos of ononderbroken beschikbaar is. Voor zover
          wettelijk toegestaan, is onze aansprakelijkheid beperkt tot directe
          schade en tot het bedrag dat in de betreffende zaak aan bookadj is
          betaald in de laatste twaalf maanden, tenzij sprake is van opzet of
          grove schuld.
        </p>
        <p>
          Wij zijn niet aansprakelijk voor schade door handelen of nalaten van
          gebruikers (bijv. geannuleerde optredens, geluidsniveaus, schade op
          locatie). Geschillen tussen klant en DJ worden in eerste instantie
          opgelost tussen partijen; zie{" "}
          <Link href="/geschillen">Hulp bij problemen</Link>.
        </p>

        <h2>8. Intellectueel eigendom</h2>
        <p>
          Teksten, logo&apos;s, software en ontwerp van bookadj zijn beschermd.
          Ongeautoriseerd kopiëren of reverse-engineeren is niet toegestaan.
        </p>

        <h2>9. Wijzigingen en beëindiging</h2>
        <p>
          Wij kunnen het platform en deze voorwaarden wijzigen. Voortgezet gebruik
          na wijziging kan als acceptatie gelden; bij wezenlijke wijzigingen
          informeren wij je waar redelijk. Je kunt je account laten sluiten via
          contact; lopende verplichtingen blijven van kracht waar van toepassing.
        </p>

        <h2>10. Toepasselijk recht en geschillen</h2>
        <p>
          Op deze voorwaarden is Nederlands recht van toepassing. Geschillen
          worden bij voorkeur in onderling overleg opgelost. Geschillen kunnen
          worden voorgelegd aan de bevoegde rechter in Nederland.
        </p>

        <p className="text-sm text-gray-500">
          Zie ook:{" "}
          <Link href="/privacy">Privacybeleid</Link>,{" "}
          <Link href="/cookiebeleid">Cookiebeleid</Link>.
        </p>
      </div>
    </MarketingPageShell>
  );
}
