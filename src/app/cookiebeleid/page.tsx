import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Cookiebeleid — bookadj",
  description: "Welke cookies bookadj gebruikt en waarom.",
};

export default function CookiebeleidPage() {
  return (
    <MarketingPageShell maxWidth="prose">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
        Juridisch
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Cookiebeleid
      </h1>
      <p className="mt-4 text-sm text-slate-500">
        Laatst bijgewerkt: april 2026
      </p>

      <div className="prose-bookadj mt-10 max-w-none">
        <h2>Wat zijn cookies?</h2>
        <p>
          Cookies zijn kleine tekstbestanden die op je apparaat worden geplaatst
          wanneer je een website bezoekt. Ze helpen de site te laten werken of
          geven ons inzicht in gebruik — afhankelijk van het type cookie.
        </p>

        <h2>Functionele cookies</h2>
        <p>
          Deze cookies zijn nodig voor basisfunctionaliteit: bijvoorbeeld
          ingelogd blijven, taalvoorkeur, beveiliging (CSRF), en het onthouden van
          formulierstappen. Zonder deze cookies werkt het platform niet goed. Ze
          worden geplaatst op grond van gerechtvaardigd belang / noodzakelijkheid
          voor de dienst.
        </p>

        <h2>Analytische cookies</h2>
        <p>
          Met analytische cookies meten wij hoe bezoekers het platform gebruiken
          (bijv. populaire pagina&apos;s, fouten). Waar mogelijk gebruiken wij
          privacy-vriendelijke instellingen (zoals IP-anonimisatie) en vragen wij
          waar vereist toestemming via een cookiebanner. Je kunt analytische
          cookies weigeren als die optie wordt aangeboden.
        </p>

        <h2>Marketingcookies</h2>
        <p>
          Marketing- of trackingcookies worden gebruikt om relevante advertenties
          te tonen of campagnes te meten (bijv. social media pixels). Deze cookies
          plaatsen wij alleen met jouw <strong>toestemming</strong>. Je kunt je
          voorkeuren later aanpassen in je browser of via onze cookie-instellingen
          indien beschikbaar.
        </p>

        <h2>Beheer van cookies</h2>
        <p>
          Via de instellingen van je browser kun je cookies verwijderen of
          blokkeren. Let op: als je alle cookies weigert, kan bookadj beperkt
          werken (bijv. inloggen).
        </p>

        <h2>Meer informatie</h2>
        <p>
          Voor hoe wij persoonsgegevens verwerken, zie ons{" "}
          <Link href="/privacy">privacybeleid</Link>. Voor gebruik van het
          platform:{" "}
          <Link href="/algemene-voorwaarden">algemene voorwaarden</Link>.
        </p>
      </div>
    </MarketingPageShell>
  );
}
