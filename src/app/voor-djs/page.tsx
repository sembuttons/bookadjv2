import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";

const djSteps = [
  {
    n: 1,
    title: "Maak je profiel aan",
    desc: "Naam, bio, genres, uurtarief, foto's en video — alles wat klanten willen zien.",
  },
  {
    n: 2,
    title: "Stel je beschikbaarheid in",
    desc: "Beheer je kalender en tarieven zodat aanvragen bij je planning passen.",
  },
  {
    n: 3,
    title: "Ontvang aanvragen",
    desc: "Klanten sturen boekingsverzoeken; jij accepteert of wijst af — volledige controle.",
  },
  {
    n: 4,
    title: "Speel en word betaald",
    desc: "Uitbetaling 48 uur na het evenement, automatisch en transparant.",
  },
] as const;

const benefits = [
  "Transparante uitbetalingen (85% van elke boeking)",
  "Geen verborgen kosten",
  "Volledige controle over je agenda",
  "Professioneel platform",
  "Betalingsbescherming voor beide partijen",
  "Support bij geschillen",
] as const;

const testimonials = [
  { name: "DJ placeholder 1", city: "Amsterdam", quote: "Tekst volgt — testimonial van een DJ op bookadj." },
  { name: "DJ placeholder 2", city: "Rotterdam", quote: "Tekst volgt — hoe bookadj helpt met serieuze aanvragen." },
  { name: "DJ placeholder 3", city: "Utrecht", quote: "Tekst volgt — ervaring met uitbetalingen en support." },
] as const;

const faqDj = [
  {
    q: "Wanneer word ik uitbetaald?",
    a: "Uitbetaling volgt 48 uur na het evenement, mits er geen open geschil is. Het exacte proces zie je in je dashboard.",
  },
  {
    q: "Hoeveel houdt bookadj in?",
    a: "Het platformfee is 15% per boeking. Jij ontvangt 85% van het afgesproken bedrag (voorbeeld: €400 boeking → €340 voor jou).",
  },
  {
    q: "Hoe werkt verificatie?",
    a: "We controleren onder meer identiteit, bedrijfsgegevens en betalingsaccount (o.a. Stripe) voordat je profiel live en vindbaar wordt.",
  },
  {
    q: "Kan ik een aanvraag weigeren?",
    a: "Ja. Je bepaalt zelf welke aanvragen je accepteert. Reageer wel binnen de gestelde termijn zodat klanten duidelijkheid hebben.",
  },
  {
    q: "Wat bij annulering?",
    a: "Annuleringen worden afgehandeld volgens de platformvoorwaarden en de status van de boeking. Bij twijfel: neem contact op met support.",
  },
  {
    q: "Moet ik alles via bookadj afhandelen?",
    a: "Ja. Betaling en berichten verlopen via het platform zodat jij en de klant beschermd zijn.",
  },
] as const;

export default function VoorDjsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />

      <section className="border-b border-neutral-200 bg-neutral-950 px-4 py-16 text-center text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Verdien meer met jouw talent
          </h1>
          <p className="mt-4 text-lg text-neutral-300">
            Sluit je aan bij bookadj en ontvang boekingsaanvragen van klanten door heel Nederland —
            met duidelijke regels en veilige uitbetalingen.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth?tab=aanmelden&role=dj"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              Aanmelden als DJ
            </Link>
            <a
              href="#hoe-werkt-het"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Meer informatie
            </a>
          </div>
        </div>
      </section>

      <section
        id="hoe-werkt-het"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="dj-steps-heading"
      >
        <h2 id="dj-steps-heading" className="text-center text-2xl font-bold sm:text-3xl">
          Hoe het werkt voor DJ&apos;s
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-2">
          {djSteps.map((s) => (
            <li key={s.n}>
              <article className="h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-neutral-600">{s.desc}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="benefits-heading" className="text-center text-2xl font-bold sm:text-3xl">
            Voordelen voor jou
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 10l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-800">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-center text-2xl font-bold sm:text-3xl">
          Platformfee in één oogopslag
        </h2>
        <p className="mt-4 text-center text-neutral-600">
          bookadj rekent <strong className="font-semibold text-neutral-900">15% platformfee</strong> op
          elke bevestigde boeking. Jij houdt{" "}
          <strong className="font-semibold text-neutral-900">85%</strong> als uitbetaling (na succesvolle
          afronding volgens onze regels).
        </p>
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Voorbeeld
          </p>
          <p className="mt-4 text-3xl font-bold text-neutral-900">
            Bij een boeking van €400 ontvang jij €340
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            €60 platformfee (15%) · €340 voor jou (85%)
          </p>
        </div>
      </section>

      <section className="border-t border-neutral-200 px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="testimonials-heading" className="text-center text-2xl font-bold sm:text-3xl">
            DJ&apos;s over bookadj
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <li
                key={t.name}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm leading-relaxed text-neutral-700">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 border-t border-neutral-100 pt-4">
                  <p className="font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-sm text-neutral-500">{t.city}</p>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="faq-dj-heading">
        <h2 id="faq-dj-heading" className="text-center text-2xl font-bold sm:text-3xl">
          FAQ voor DJ&apos;s
        </h2>
        <div className="mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {faqDj.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-left font-semibold text-neutral-900 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  {item.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-neutral-500 transition-transform group-open:rotate-180"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M5 7.5l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-emerald-600 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Klaar om te beginnen?</h2>
          <p className="mt-3 text-emerald-50">
            Maak een account en rond je profiel af — start met het ontvangen van aanvragen.
          </p>
          <Link
            href="/auth?tab=aanmelden&role=dj"
            className="mt-8 inline-flex rounded-lg bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Aanmelden als DJ
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
