import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Crown,
  Handshake,
  ShieldCheck,
} from "lucide-react";

const signupHref = "/auth?tab=aanmelden&role=dj";

const VOOR_DJS_HERO_BG =
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=1920&q=80&auto=format&fit=crop";

const usps = [
  {
    title: "Meer boekingen, minder moeite",
    body: "Klanten vinden jou, niet andersom. Jouw profiel werkt voor je — 24/7 zichtbaar voor serieuze boekers.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v3M12 18v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M3 12h3M18 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Direct contact met boekers",
    body: "Via ons veilige berichtenplatform. Alles op één plek — geen ruis op privékanalen, wel snelle antwoorden.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M8 10h8M8 14h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 5h14a2 2 0 012 2v9a2 2 0 01-2 2h-4l-4 3v-3H5a2 2 0 01-2-2V7a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Professioneel portfolio",
    body: "Laat zien wie je bent met video, mix en foto's. Een volledig profiel vertrouwen wekt — en boekingen oplevert.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 15l3-3 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Veilige betalingen",
    body: "Altijd via bookadj, nooit cash of gedoe. Boekers betalen het platform; jij wordt uitbetaald volgens duidelijke afspraken.",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="6"
          width="16"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 14h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Gratis account aanmaken",
    desc: "Registreer in minuten. Geen creditcard nodig om te starten.",
  },
  {
    n: "02",
    title: "Profiel invullen + verificatie",
    desc: "Toon je stijl, tarieven en beschikbaarheid. Na controle ga je live.",
  },
  {
    n: "03",
    title: "Boekingen ontvangen en uitvoeren",
    desc: "Accepteer aanvragen, communiceer in het platform en word uitbetaald.",
  },
] as const;

const gratisIncludes = [
  "Persoonlijk DJ-profiel met foto's en video",
  "Zichtbaarheid voor klanten in heel Nederland",
  "Veilig berichtenverkeer met boekers",
  "Kalender en boekingsoverzicht in je dashboard",
  "Betalingen en uitbetalingen via het platform",
  "Support bij vragen over je account",
] as const;

export default function VoorDjsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0a0a0a] px-4 pb-20 pt-16 text-white sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
        <div
          className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${VOOR_DJS_HERO_BG})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a0a0a]/92 via-[#0a0a0a]/88 to-[#0a0a0a]/95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.22),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500/90">
            Voor professionele DJ&apos;s
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.08]">
            Jouw talent.
            <br />
            <span className="bg-gradient-to-r from-white via-white to-green-400/90 bg-clip-text text-transparent">
              Jouw podium.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 sm:text-xl">
            Meer boekingen, minder moeite. Gratis aanmelden, geen verborgen
            kosten.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={signupHref}
              className="inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:bg-green-400 sm:w-auto"
            >
              Maak een gratis profiel aan
            </Link>
            <a
              href="#hoe-het-werkt"
              className="inline-flex w-full items-center justify-center rounded-xl border border-green-800/40 bg-[#0f172a]/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:border-green-800 hover:bg-[#0f172a] sm:w-auto"
            >
              Zo werkt het
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Serieuze boekers · Veilige betalingen · Duidelijke afspraken
          </p>
        </div>
      </section>

      {/* USP */}
      <section
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        aria-labelledby="usp-heading"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="usp-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Alles wat je nodig hebt om te groeien
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Eén platform voor zichtbaarheid, communicatie en betaling — zodat jij
            je kunt focussen op je set.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {usps.map((u) => (
            <li key={u.title}>
              <article className="group flex h-full flex-col rounded-2xl border border-gray-800/80 bg-[#111827] p-8 shadow-sm transition duration-300 hover:border-green-800/40 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#052e16] text-green-400 transition group-hover:bg-[#052e16]/70">
                  {u.icon}
                </div>
                <h3 className="mt-6 text-lg font-bold text-white">
                  {u.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">
                  {u.body}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* How bookadj helps the artist */}
      <section
        className="bg-[#0a0a0a] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="helps-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="helps-heading"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Hoe bookadj jou helpt als artiest
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Meer vrijheid, meer vertrouwen en een workflow die klopt.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: Crown,
                title: "Eigen baas",
                body: "Jij bepaalt je tarief, beschikbaarheid en welke boekingen je accepteert. Geen tussenpersoon die dicteert.",
              },
              {
                Icon: BriefcaseBusiness,
                title: "Meer zichtbaarheid",
                body: "Je profiel is zichtbaar voor duizenden potentiële boekers in heel Nederland.",
              },
              {
                Icon: ShieldCheck,
                title: "Veilig betaald",
                body: "Betaling wordt vastgehouden tot na het event. Nooit meer achter je geld aan.",
              },
              {
                Icon: Camera,
                title: "Professioneel profiel",
                body: "Laat zien wie je bent met video, foto's en je beste mixen.",
              },
              {
                Icon: Handshake,
                title: "Direct contact",
                body: "Communiceer rechtstreeks met boekers via ons platform. Geen e-mailchaos.",
              },
              {
                Icon: BadgeCheck,
                title: "Groeien samen",
                body: "Hoe meer boekingen je doet, hoe hoger je in de zoekresultaten komt.",
              },
            ].map(({ Icon, title, body }) => (
              <li key={title}>
                <article className="h-full rounded-2xl border border-gray-800 bg-[#111827] p-7 shadow-sm transition-all duration-200 hover:border-green-800/50 hover:bg-[#0f172a]/30">
                  <Icon
                    className="h-7 w-7 text-green-500"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        id="hoe-het-werkt"
        className="border-y border-gray-800 bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        aria-labelledby="steps-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="steps-heading"
            className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Zo werkt het
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-400">
            Drie stappen van aanmelden tot je eerste boeking op het podium.
          </p>

          <ol className="mt-16 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-0">
            {steps.map((s, i) => (
              <li
                key={s.n}
                id={i === 1 ? "verificatie" : undefined}
                className={`flex flex-1 flex-col items-center text-center lg:min-w-0 lg:items-start lg:text-left ${i === 1 ? "scroll-mt-24" : ""}`}
              >
                <div className="flex w-full items-start gap-0 lg:gap-4">
                  <div className="flex flex-1 flex-col items-center lg:items-start">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-sm font-bold tracking-wide text-green-500">
                      {s.n}
                    </span>
                    <h3 className="mt-6 text-xl font-bold text-white">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      {s.desc}
                    </p>
                  </div>
                  {i < steps.length - 1 ? (
                    <div
                      className="hidden shrink-0 self-center pt-7 lg:flex lg:items-center lg:px-2"
                      aria-hidden
                    >
                      <div className="h-px w-12 bg-gradient-to-r from-green-500/50 to-green-400/30 xl:w-16" />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="pricing-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Gratis account
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Geen maandbedrag. Je betaalt alleen mee als er daadwerkelijk geboekt
            wordt.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#111827] shadow-xl shadow-black/30 ring-1 ring-gray-800/30">
            <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] px-8 py-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-400">
                Altijd starten met
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-white">€ 0</p>
              <p className="mt-1 text-sm text-gray-500">per maand</p>
            </div>
            <div className="px-8 py-10">
              <p className="text-sm font-semibold text-white">
                Dit zit erbij
              </p>
              <ul className="mt-6 space-y-4">
                {gratisIncludes.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-gray-400">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#052e16]/70 text-green-400">
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M2.5 6l2.5 2.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-10 rounded-2xl bg-[#0f172a] p-5 text-left">
                <p className="text-sm font-semibold text-white">
                  Platformcommission
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  bookadj houdt per bevestigde boeking een platformcommission in
                  — gangbaar <strong className="font-semibold text-white">10–15%</strong> van het
                  boekingsbedrag, afhankelijk van het type opdracht en je
                  overeenkomst. Het exacte percentage zie je transparant in je
                  dashboard vóór je een aanvraag accepteert.
                </p>
              </div>
              <Link
                href={signupHref}
                className="mt-8 flex w-full items-center justify-center rounded-xl bg-green-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:bg-green-400"
              >
                Maak een gratis profiel aan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section
        className="border-t border-gray-800 bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="testimonial-heading"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            id="testimonial-heading"
            className="text-center text-sm font-semibold uppercase tracking-wider text-green-400"
          >
            Ervaring van een DJ
          </h2>
          <figure className="mt-10 overflow-hidden rounded-3xl border border-gray-800 bg-[#111827] p-8 shadow-sm sm:p-10 md:flex md:gap-10 md:p-12">
            <div className="mx-auto flex shrink-0 flex-col items-center md:mx-0">
              <img
                src="https://images.unsplash.com/photo-1571266028243-e631f2e28e4b?w=200&q=80&auto=format&fit=crop"
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-4 ring-green-800/50 shadow-inner"
                width={96}
                height={96}
              />
              <figcaption className="mt-4 text-center md:text-left">
                <p className="font-bold text-white">DJ Sam Rivers</p>
                <p className="text-sm text-gray-500">House &amp; disco · Utrecht</p>
              </figcaption>
            </div>
            <blockquote className="mt-8 flex-1 md:mt-0">
              <p className="text-lg leading-relaxed text-gray-400 sm:text-xl">
                <span className="text-4xl leading-none text-green-500/40">
                  &ldquo;
                </span>
                Sinds ik op bookadj sta, krijg ik serieuze aanvragen zonder
                eindeloos te onderhandelen op Instagram. Alles loopt via één
                plek — en ik weet dat ik betaald word. Dat geeft rust voor een
                drukke weekendagenda.
                <span className="text-4xl leading-none text-green-500/40">
                  &rdquo;
                </span>
              </p>
            </blockquote>
          </figure>
          <p className="mt-4 text-center text-xs text-gray-500">
            Fictief voorbeeld — placeholder tot we echte DJ-verhalen publiceren.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#0a0a0a] px-4 py-20 text-center text-white sm:px-6 sm:py-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(34,197,94,0.14),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Klaar om meer te boeken?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Maak vandaag nog je gratis profiel aan en word vindbaar voor klanten
            die een betrouwbare DJ zoeken.
          </p>
          <Link
            href={signupHref}
            className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:bg-green-400 sm:w-auto"
          >
            Maak een gratis profiel aan
          </Link>
        </div>
      </section>
    </div>
  );
}
