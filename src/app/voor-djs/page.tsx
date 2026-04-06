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
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0a0a0b] px-4 pb-20 pt-16 text-white sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
        <div
          className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${VOOR_DJS_HERO_BG})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-20 bg-gradient-to-b from-[#0a0a0b]/92 via-[#0a0a0b]/88 to-[#0a0a0b]/95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(52,211,153,0.18),transparent)]"
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
            Voor professionele DJ&apos;s
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.08]">
            Jouw talent.
            <br />
            <span className="bg-gradient-to-r from-white via-white to-emerald-200/90 bg-clip-text text-transparent">
              Jouw podium.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
            Meer boekingen, minder moeite. Gratis aanmelden, geen verborgen
            kosten.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={signupHref}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-neutral-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 sm:w-auto"
            >
              Maak een gratis profiel aan
            </Link>
            <a
              href="#hoe-het-werkt"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
            >
              Zo werkt het
            </a>
          </div>
          <p className="mt-8 text-sm text-neutral-500">
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
            className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Alles wat je nodig hebt om te groeien
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Eén platform voor zichtbaarheid, communicatie en betaling — zodat jij
            je kunt focussen op je set.
          </p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {usps.map((u) => (
            <li key={u.title}>
              <article className="group flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm transition duration-300 hover:border-emerald-200/80 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                  {u.icon}
                </div>
                <h3 className="mt-6 text-lg font-bold text-neutral-900">
                  {u.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
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
            <p className="mt-4 text-lg text-white/70">
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
                <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-7 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-emerald-400/30 hover:bg-white/10">
                  <Icon
                    className="h-7 w-7 text-emerald-400"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
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
        className="border-y border-neutral-200 bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        aria-labelledby="steps-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="steps-heading"
            className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Zo werkt het
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-neutral-600">
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
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-bold tracking-wide text-emerald-400">
                      {s.n}
                    </span>
                    <h3 className="mt-6 text-xl font-bold text-neutral-900">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                      {s.desc}
                    </p>
                  </div>
                  {i < steps.length - 1 ? (
                    <div
                      className="hidden shrink-0 self-center pt-7 lg:flex lg:items-center lg:px-2"
                      aria-hidden
                    >
                      <div className="h-px w-12 bg-gradient-to-r from-emerald-400/50 to-emerald-200/30 xl:w-16" />
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
            className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Gratis account
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Geen maandbedrag. Je betaalt alleen mee als er daadwerkelijk geboekt
            wordt.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/5 ring-1 ring-black/5">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 px-8 py-10 text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Altijd starten met
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight">€ 0</p>
              <p className="mt-1 text-sm text-neutral-400">per maand</p>
            </div>
            <div className="px-8 py-10">
              <p className="text-sm font-semibold text-neutral-900">
                Dit zit erbij
              </p>
              <ul className="mt-6 space-y-4">
                {gratisIncludes.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-neutral-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
              <div className="mt-10 rounded-2xl bg-neutral-50 p-5 text-left">
                <p className="text-sm font-semibold text-neutral-900">
                  Platformcommission
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  bookadj houdt per bevestigde boeking een platformcommission in
                  — gangbaar <strong className="font-semibold text-neutral-800">10–15%</strong> van het
                  boekingsbedrag, afhankelijk van het type opdracht en je
                  overeenkomst. Het exacte percentage zie je transparant in je
                  dashboard vóór je een aanvraag accepteert.
                </p>
              </div>
              <Link
                href={signupHref}
                className="mt-8 flex w-full items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                Maak een gratis profiel aan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section
        className="border-t border-neutral-200 bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="testimonial-heading"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            id="testimonial-heading"
            className="text-center text-sm font-semibold uppercase tracking-wider text-emerald-600"
          >
            Ervaring van een DJ
          </h2>
          <figure className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10 md:flex md:gap-10 md:p-12">
            <div className="mx-auto flex shrink-0 flex-col items-center md:mx-0">
              <img
                src="https://images.unsplash.com/photo-1571266028243-e631f2e28e4b?w=200&q=80&auto=format&fit=crop"
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-inner"
                width={96}
                height={96}
              />
              <figcaption className="mt-4 text-center md:text-left">
                <p className="font-bold text-neutral-900">DJ Sam Rivers</p>
                <p className="text-sm text-neutral-500">House &amp; disco · Utrecht</p>
              </figcaption>
            </div>
            <blockquote className="mt-8 flex-1 md:mt-0">
              <p className="text-lg leading-relaxed text-neutral-700 sm:text-xl">
                <span className="text-4xl leading-none text-emerald-500/40">
                  &ldquo;
                </span>
                Sinds ik op bookadj sta, krijg ik serieuze aanvragen zonder
                eindeloos te onderhandelen op Instagram. Alles loopt via één
                plek — en ik weet dat ik betaald word. Dat geeft rust voor een
                drukke weekendagenda.
                <span className="text-4xl leading-none text-emerald-500/40">
                  &rdquo;
                </span>
              </p>
            </blockquote>
          </figure>
          <p className="mt-4 text-center text-xs text-neutral-400">
            Fictief voorbeeld — placeholder tot we echte DJ-verhalen publiceren.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#0a0a0b] px-4 py-20 text-center text-white sm:px-6 sm:py-24 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(52,211,153,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Klaar om meer te boeken?
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Maak vandaag nog je gratis profiel aan en word vindbaar voor klanten
            die een betrouwbare DJ zoeken.
          </p>
          <Link
            href={signupHref}
            className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-neutral-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:w-auto"
          >
            Maak een gratis profiel aan
          </Link>
        </div>
      </section>
    </div>
  );
}
