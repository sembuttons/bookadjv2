import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Hulp bij problemen — bookadj",
  description:
    "Hoe bookadj helpt bij conflicten tussen klanten en DJ's.",
};

export default function GeschillenPage() {
  return (
    <MarketingPageShell maxWidth="prose">
      <p className="text-sm font-semibold uppercase tracking-wide text-bookadj-soft">
        Support
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Hulp bij problemen
      </h1>
      <p className="mt-4 text-lg text-ink-secondary">
        Soms lopen afspraken scheef — tussen klant en DJ of door
        miscommunicatie. bookadj is er om eerlijk mee te kijken en tot een
        oplossing te komen binnen het platform.
      </p>

      <section className="mt-12 space-y-6 text-ink-secondary">
        <h2 className="text-xl font-bold text-ink">
          Stappenplan
        </h2>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-sm font-bold text-bookadj-soft">Stap 1</p>
          <h3 className="mt-1 font-semibold text-ink">
            Neem contact op
          </h3>
          <p className="mt-2 text-sm">
            Probeer eerst via de berichten op bookadj tot elkaar te komen. Blijft
            het spanning? Stuur ons een duidelijke melding via het{" "}
            <Link href="/contact" className="font-semibold text-ink underline">
              contactformulier
            </Link>{" "}
            met je boekingsreferentie en een korte tijdlijn van wat er gebeurd is.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-sm font-bold text-bookadj-soft">Stap 2</p>
          <h3 className="mt-1 font-semibold text-ink">
            bookadj bekijkt het dossier
          </h3>
          <p className="mt-2 text-sm">
            We lezen de communicatie op het platform, de status van de boeking en
            relevante voorwaarden. We kunnen aanvullende vragen stellen aan beide
            partijen.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-sm font-bold text-bookadj-soft">Stap 3</p>
          <h3 className="mt-1 font-semibold text-ink">
            Oplossing binnen 48 uur
          </h3>
          <p className="mt-2 text-sm">
            We streven ernaar binnen <strong>48 uur</strong> (werkdagen) een
            voorstel te doen: bijvoorbeeld gedeeltelijke terugbetaling,
            herplanning, of een andere afspraak die past bij de situatie. Complexe
            zaken kunnen iets langer duren; dan houden we je op de hoogte.
          </p>
        </div>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        Juridische kaders: zie ook{" "}
        <Link href="/algemene-voorwaarden" className="underline">
          Algemene voorwaarden
        </Link>{" "}
        en{" "}
        <Link href="/privacy" className="underline">
          Privacybeleid
        </Link>
        .
      </p>
    </MarketingPageShell>
  );
}
