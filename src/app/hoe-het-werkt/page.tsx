import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const steps = [
  {
    n: 1,
    title: "Zoek een DJ",
    desc: "Filter op stad, datum en genre en ontdek DJ's die bij jouw evenement passen.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: 2,
    title: "Bekijk profielen",
    desc: "Video, reviews en transparante prijzen — zo weet je precies wat je krijgt.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 15l3-3 3 3 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: 3,
    title: "Stuur een aanvraag",
    desc: "Je kaart wordt vastgehouden en pas belast wanneer de DJ je aanvraag accepteert.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    n: 4,
    title: "Geniet van je evenement",
    desc: "Herinneringen, support en na afloop een review — wij staan achter elke boeking.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M8.5 12.5l2 2 5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

const usps = [
  {
    title: "Geverifieerde DJ's",
    desc: "ID, KVK en betalingscontrole voordat een profiel live gaat.",
  },
  {
    title: "Transparante prijzen",
    desc: "Duidelijke uurtarieven en geen verborgen kosten op het platform.",
  },
  {
    title: "Betalingsbescherming",
    desc: "Je betaalt veilig via bookadj; uitbetaling aan de DJ volgens duidelijke regels.",
  },
  {
    title: "Support & geschillen",
    desc: "Hulp bij vragen en een vast proces als er iets misgaat.",
  },
] as const;

const faq = [
  {
    q: "Wanneer wordt mijn kaart belast?",
    a: "Pas nadat de DJ je aanvraag heeft geaccepteerd. Tot die tijd wordt het bedrag alleen gereserveerd of vastgehouden volgens de betaalstroom.",
  },
  {
    q: "Wat als de DJ niet reageert?",
    a: "Aanvragen hebben een beperkte geldigheid. Reageert de DJ niet tijdig, vervalt de aanvraag en hoef je niet te betalen voor die boeking.",
  },
  {
    q: "Kan ik annuleren?",
    a: "Annuleringsvoorwaarden hangen af van het moment en de afspraken rond je boeking. Check de voorwaarden op je bevestiging en neem bij twijfel contact op.",
  },
  {
    q: "Hoe werkt de servicefee?",
    a: "Het platform houdt een percentage in op elke boeking; de DJ ontvangt het overeengekomen deel. Zo houden we het platform veilig en ondersteund.",
  },
  {
    q: "Mag ik buiten het platform afspreken?",
    a: "Nee. Communicatie en betaling lopen via bookadj zodat beide partijen beschermd blijven. Off-platform berichten worden geflagd.",
  },
  {
    q: "Hoe weet ik of een DJ goed is?",
    a: "Bekijk reviews, genres, voorbeelden en de verificatiebadge. Twijfel je? Stel eerst een vraag via het berichtensysteem.",
  },
  {
    q: "Wat als de DJ niet komt opdagen?",
    a: "Meld dit direct via het platform. We behandelen geschillen volgens ons proces en zoeken naar een eerlijke oplossing.",
  },
  {
    q: "Kan ik een DJ boeken voor elk type feest?",
    a: "Ja — van bruiloft tot bedrijfsfeest. Filter op genre en stad en stuur een aanvraag met jouw wensen.",
  },
] as const;

export default function HoeHetWerktPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />

      <section className="border-b border-neutral-200 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hoe werkt bookadj?
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Van zoeken tot feest: in een paar stappen regel je een geverifieerde DJ met
            duidelijke prijzen en veilige betaling.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="sr-only">
          Stappenplan
        </h2>
        <ol className="grid gap-12 lg:grid-cols-2">
          {steps.map((s) => (
            <li key={s.n}>
              <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white">
                    {s.n}
                  </span>
                  <div className="text-neutral-900">{s.icon}</div>
                </div>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-neutral-600">{s.desc}</p>
                <div
                  className="mt-8 aspect-[16/10] w-full rounded-xl bg-neutral-200 ring-1 ring-neutral-200"
                  aria-hidden
                />
                <p className="mt-2 text-center text-xs text-neutral-500">
                  Afbeelding placeholder
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="trust-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="trust-heading" className="text-center text-2xl font-bold sm:text-3xl">
            Waarom klanten voor bookadj kiezen
          </h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {usps.map((u) => (
              <li
                key={u.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-neutral-900">{u.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{u.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-center text-2xl font-bold sm:text-3xl">
          Veelgestelde vragen
        </h2>
        <div className="mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {faq.map((item) => (
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

      <section className="border-t border-neutral-200 bg-neutral-950 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Klaar om te zoeken?</h2>
          <p className="mt-3 text-neutral-300">
            Vind jouw DJ in een paar minuten.
          </p>
          <Link
            href="/zoeken"
            className="mt-8 inline-flex rounded-lg bg-white px-8 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            Zoek jouw DJ
          </Link>
        </div>
      </section>

    </div>
  );
}
