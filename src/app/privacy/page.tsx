import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Privacybeleid — bookadj",
  description: "Hoe bookadj persoonsgegevens verwerkt (AVG/GDPR).",
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell maxWidth="prose">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Juridisch
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Privacybeleid
      </h1>
      <p className="mt-4 text-sm text-neutral-500">
        Laatst bijgewerkt: april 2026
      </p>

      <div className="prose prose-neutral mt-10 max-w-none text-neutral-600 prose-headings:text-neutral-900 prose-a:text-bookadj">
        <h2>1. Wie zijn wij?</h2>
        <p>
          bookadj (&quot;wij&quot;, &quot;ons&quot;) exploiteert het online
          platform bookadj.nl waar klanten DJ&apos;s kunnen vinden en boeken. Voor
          vragen over dit beleid:{" "}
          <a href="mailto:hallo@bookadj.nl">hallo@bookadj.nl</a> of via{" "}
          <Link href="/contact">contact</Link>.
        </p>

        <h2>2. Welke gegevens verzamelen wij?</h2>
        <p>Afhankelijk van je gebruik van het platform kunnen wij onder meer verwerken:</p>
        <ul>
          <li>
            <strong>Account- en contactgegevens:</strong> naam, e-mailadres,
            telefoonnummer (indien opgegeven), wachtwoord (versleuteld), rol
            (klant/DJ).
          </li>
          <li>
            <strong>Profiel- en boekingsgegevens:</strong> DJ-profielinformatie,
            beschikbaarheid, berichten tussen gebruikers, boekingsdetails,
            evenementdatum en -locatie, bedragen.
          </li>
          <li>
            <strong>Betalingsgegevens:</strong> transacties worden verwerkt door
            onze betaalpartner (Stripe). Wij ontvangen geen volledige
            kaartnummers; wel status van betalingen en uitbetalingen.
          </li>
          <li>
            <strong>Technische gegevens:</strong> IP-adres, browsertype,
            apparaat, logbestanden, cookies (zie ook{" "}
            <Link href="/cookiebeleid">cookiebeleid</Link>).
          </li>
        </ul>

        <h2>3. Waarom verwerken wij deze gegevens?</h2>
        <p>Wij verwerken persoonsgegevens op basis van:</p>
        <ul>
          <li>
            <strong>Uitvoering van de overeenkomst</strong> — account aanmaken,
            boekingen, berichten, betalingen en uitbetalingen.
          </li>
          <li>
            <strong>Gerechtvaardigd belang</strong> — fraudepreventie,
            beveiliging, verbetering van het platform, support en (beperkte)
            analyse van gebruik.
          </li>
          <li>
            <strong>Wettelijke verplichting</strong> — bijvoorbeeld fiscale of
            administratieve bewaarplicht.
          </li>
          <li>
            <strong>Toestemming</strong> — waar wij die expliciet vragen (bijv.
            marketingcookies of nieuwsbrief); je kunt toestemming intrekken.
          </li>
        </ul>

        <h2>4. Delen met derden</h2>
        <p>
          Wij delen gegevens alleen met partijen die nodig zijn voor de dienst:
          hosting, e-mail/notificaties, betalingen (Stripe), analytics indien
          ingeschakeld, en waar wettelijk verplicht. Met deze partijen sluiten wij
          waar nodig verwerkersovereenkomsten.
        </p>

        <h2>5. Bewaartermijnen</h2>
        <p>
          Wij bewaren gegevens niet langer dan nodig voor de doeleinden waarvoor
          ze zijn verzameld, tenzij een langere termijn wettelijk verplicht is.
          Accountgegevens worden bewaard zolang je account actief is; na
          verwijdering kunnen bepaalde gegevens nog in back-ups of voor
          geschillen/fiscale termijnen aanwezig blijven binnen wettelijke grenzen.
        </p>

        <h2>6. Beveiliging</h2>
        <p>
          Wij nemen passende technische en organisatorische maatregelen om
          persoonsgegevens te beschermen tegen verlies, ongeautoriseerde toegang
          of misbruik. Geen enkele methode van verzending over internet is 100%
          veilig; wij streven naar best practices.
        </p>

        <h2>7. Jouw rechten (AVG / GDPR)</h2>
        <p>Je hebt onder meer recht op:</p>
        <ul>
          <li>
            <strong>Inzage</strong> — welke gegevens wij van jou verwerken.
          </li>
          <li>
            <strong>Rectificatie</strong> — correctie van onjuiste gegevens.
          </li>
          <li>
            <strong>Verwijdering</strong> — in bepaalde gevallen (&quot;recht om
            vergeten te worden&quot;).
          </li>
          <li>
            <strong>Beperking</strong> van de verwerking.
          </li>
          <li>
            <strong>Bezwaar</strong> tegen verwerking op basis van gerechtvaardigd
            belang.
          </li>
          <li>
            <strong>Dataportabiliteit</strong> — waar van toepassing, in een
            gangbaar formaat.
          </li>
          <li>
            <strong>Klacht</strong> bij de Autoriteit Persoonsgegevens (AP) in
            Nederland.
          </li>
        </ul>
        <p>
          Om je rechten uit te oefenen, neem contact op via{" "}
          <a href="mailto:hallo@bookadj.nl">hallo@bookadj.nl</a>. Wij reageren
          binnen de wettelijke termijnen.
        </p>

        <h2>8. Internationale doorgifte</h2>
        <p>
          Sommige dienstverleners kunnen buiten de EER opereren. Waar dat gebeurt,
          zorgen wij voor passende waarborgen (zoals standaardcontractbepalingen)
          conform de AVG.
        </p>

        <h2>9. Wijzigingen</h2>
        <p>
          Wij kunnen dit beleid aanpassen. De actuele versie staat altijd op deze
          pagina; bij ingrijpende wijzigingen informeren wij je waar passend via
          het platform of per e-mail.
        </p>

        <p className="text-sm text-neutral-500">
          Zie ook:{" "}
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>,{" "}
          <Link href="/cookiebeleid">Cookiebeleid</Link>.
        </p>
      </div>
    </MarketingPageShell>
  );
}
