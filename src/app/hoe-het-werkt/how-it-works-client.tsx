"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  ThumbsUp,
  UserPlus,
  Wallet,
} from "lucide-react";

/** Zelfde sfeer als Voor DJ’s: één achtergrond met donkere overlay + groene gloed. */
const HERO_BG =
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=1920&q=80&auto=format&fit=crop";

type FlowKey = "klant" | "dj";

type Step = {
  n: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const customerSteps: Step[] = [
  {
    n: "01",
    title: "Zoek een DJ",
    desc: "Filter op gelegenheid, stad en budget. Bekijk profielen, video's en reviews van echte klanten.",
    Icon: Search,
  },
  {
    n: "02",
    title: "Stuur een boekingsverzoek",
    desc: "Kies datum, tijd en locatie. Stuur je verzoek — de DJ heeft 24 uur om te reageren.",
    Icon: MessageSquare,
  },
  {
    n: "03",
    title: "Betaal veilig via bookadj",
    desc: "Je betaling wordt veilig vastgehouden. Pas na het event wordt de DJ uitbetaald.",
    Icon: CreditCard,
  },
  {
    n: "04",
    title: "Geniet van je feest",
    desc: "De DJ speelt, jij geniet. Na afloop kun je een review achterlaten.",
    Icon: ThumbsUp,
  },
];

const djSteps: Step[] = [
  {
    n: "01",
    title: "Maak een gratis profiel",
    desc: "Vul je bio, tarief, gelegenheden en media in. Laat zien wie je bent.",
    Icon: UserPlus,
  },
  {
    n: "02",
    title: "Verificatie",
    desc: "bookadj verifieert je identiteit en gegevens. Daarna ben je zichtbaar voor boekers.",
    Icon: BadgeCheck,
  },
  {
    n: "03",
    title: "Ontvang boekingsverzoeken",
    desc: "Accepteer of weiger binnen 24 uur. Communiceer via het platform.",
    Icon: CalendarDays,
  },
  {
    n: "04",
    title: "Speel en word betaald",
    desc: "Na het event wordt je uitbetaald. Veilig, snel en betrouwbaar.",
    Icon: Wallet,
  },
];

function FlowToggle({
  value,
  onChange,
}: {
  value: FlowKey;
  onChange: (v: FlowKey) => void;
}) {
  return (
    <div className="mt-8 inline-flex w-full max-w-md rounded-2xl bg-[#111827]/10 p-1.5 ring-1 ring-white/15 backdrop-blur-sm sm:w-auto">
      {(
        [
          { key: "klant" as const, label: "Voor klanten" },
          { key: "dj" as const, label: "Voor DJ's" },
        ] as const
      ).map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`min-h-[44px] flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 sm:flex-initial sm:px-6 ${
              active ? "bg-[#111827] text-white" : "text-white/80 hover:text-white"
            }`}
            aria-pressed={active}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function StepTimeline({ steps }: { steps: Step[] }) {
  return (
    <>
      {/* Desktop: horizontal connector */}
      <div className="relative mt-12 hidden lg:block">
        <div
          className="pointer-events-none absolute left-6 right-6 top-10 h-px bg-green-800/50"
          aria-hidden
        />
        <div className="grid gap-6 lg:grid-cols-4">
          {steps.map((s) => (
            <article
              key={s.n}
              className="card-interactive relative z-10 flex h-full flex-col p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-2xl font-extrabold tracking-tight text-green-400">
                  {s.n}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#052e16] text-green-400 ring-1 ring-green-800/35">
                  <s.Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {s.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Mobile/tablet: vertical connector */}
      <ol className="mt-10 space-y-4 lg:hidden">
        {steps.map((s, idx) => (
          <li key={s.n} className="relative">
            {idx < steps.length - 1 ? (
              <div
                className="pointer-events-none absolute left-7 top-14 h-[calc(100%-1rem)] w-px bg-green-800/50"
                aria-hidden
              />
            ) : null}
            <article className="card-interactive flex gap-4 p-5">
              <div className="flex shrink-0 flex-col items-center">
                <span className="text-xl font-extrabold text-green-400">
                  {s.n}
                </span>
                <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#052e16] text-green-400 ring-1 ring-green-800/35">
                  <s.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                  {s.desc}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}

const faq = [
  {
    q: "Wat gebeurt er als een DJ annuleert?",
    a: "We proberen een passende vervanger te regelen. Lukt dat niet op tijd, dan streven we naar een volledige terugbetaling volgens het beleid.",
  },
  {
    q: "Hoe lang duurt verificatie?",
    a: "Meestal 1–2 werkdagen (indicatie). Je ontvangt een e-mail zodra je profiel geverifieerd is.",
  },
  {
    q: "Kan ik een boeking wijzigen?",
    a: "Ja, vaak wel. Stuur via het platform een bericht met je wijziging; we kijken samen wat mogelijk is.",
  },
  {
    q: "Wat als ik niet tevreden ben?",
    a: "Neem direct contact op. We hanteren een proces voor support en geschillen om tot een eerlijke oplossing te komen.",
  },
  {
    q: "Hoe worden DJs gescreend?",
    a: "DJ’s doorlopen controles (o.a. identiteit/bedrijf) voordat ze als geverifieerd zichtbaar worden.",
  },
  {
    q: "Zijn er extra kosten bovenop het uurtarief?",
    a: "Soms reiskosten of extra apparatuur. Je ziet dit transparant (indicatie) voordat je een aanvraag verstuurt.",
  },
  {
    q: "Hoe snel reageert een DJ gemiddeld?",
    a: "Veel DJ’s reageren binnen enkele uren. Een verzoek heeft maximaal 24 uur om geaccepteerd te worden.",
  },
  {
    q: "Kan ik meerdere DJs tegelijk aanvragen?",
    a: "Ja. Je kunt meerdere aanvragen versturen om snel opties te vergelijken.",
  },
] as const;

export function HowItWorksClient() {
  const [flow, setFlow] = useState<FlowKey>("klant");
  const steps = useMemo(
    () => (flow === "klant" ? customerSteps : djSteps),
    [flow],
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — aansluitend op Voor DJ’s: één kleurvlak met subtiele gradient */}
      <section className="relative isolate min-h-[min(88vh,720px)] w-full overflow-x-clip text-white">
        <div
          className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
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
          className="pointer-events-none absolute inset-0 -z-[5] opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(88vh,720px)] max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-28 lg:px-8">
          <h1 className="text-balance text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl md:text-6xl">
            Hoe werkt bookadj?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg">
            Van zoeken naar de perfecte DJ tot een onvergetelijk feest — wij regelen het.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/zoeken"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-black shadow-lg shadow-green-500/25 transition-all duration-200 hover:bg-green-400"
            >
              Ik zoek een DJ
            </Link>
            <Link
              href="/voor-djs"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-green-800/40 bg-[#0f172a]/50 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-green-800 hover:bg-[#0f172a]"
            >
              Ik ben een DJ
            </Link>
          </div>

          <div className="mt-12 w-full max-w-md sm:max-w-lg">
            <FlowToggle value={flow} onChange={setFlow} />
          </div>

          <a
            href="#stap-voor-stap"
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-white/80 transition-colors hover:text-white"
          >
            <span className="sr-only">Scroll naar uitleg</span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827]/10 ring-1 ring-white/20 backdrop-blur-sm"
              aria-hidden
            >
              <svg
                className="h-5 w-5 animate-bounce"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </section>

      {/* Section 1/2 steps */}
      <section
        id="stap-voor-stap"
        className="mx-auto max-w-7xl scroll-mt-24 bg-gradient-to-b from-[#0a0a0a] via-[#0b100e] to-[#0a0a0a] px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-400">
            {flow === "klant" ? "Voor klanten" : "Voor DJ's"}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Stap voor stap
          </h2>
          <p className="mt-3 text-gray-400">
            Duidelijk proces, premium ervaring — zonder verrassingen.
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-green-500" aria-hidden />
        </div>

        <StepTimeline steps={steps} />
      </section>

      {/* Section 3 — betaalflow */}
      <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0c1411] to-[#0a0a0a] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Betaalflow (in het kort)
            </h2>
            <p className="mt-3 text-gray-400">
              Transparant en veilig: je weet precies waar je geld is.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            {(
              [
                { t: "Klant betaalt", d: "Betaal veilig via het platform.", Icon: CreditCard },
                { t: "bookadj houdt vast", d: "Bescherming tot na het event.", Icon: ShieldCheck },
                { t: "Event vindt plaats", d: "DJ draait, jij geniet.", Icon: ThumbsUp },
                { t: "DJ ontvangt uitbetaling", d: "Uitbetaling na afloop.", Icon: Wallet },
              ] as const
            ).map((b, i) => (
              <div key={b.t} className="contents">
                <div className="card-interactive flex h-full flex-col gap-2 p-6">
                  <b.Icon className="h-6 w-6 text-green-400" strokeWidth={1.75} aria-hidden />
                  <p className="font-bold text-white">{b.t}</p>
                  <p className="text-sm text-gray-400">{b.d}</p>
                </div>
                {i < 3 ? (
                  <div className="hidden justify-center lg:flex" aria-hidden>
                    <ArrowRight className="h-6 w-6 text-green-500" strokeWidth={2} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — annuleringsbeleid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Annuleringsbeleid (indicatie)
          </h2>
          <p className="mt-3 text-gray-400">
            Richtlijnen ten opzichte van de datum van je evenement.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-green-800/40 bg-[#052e16] p-6">
            <p className="font-bold text-green-400">30+ dagen voor event</p>
            <p className="mt-2 text-sm text-green-400/80">
              Volledige terugbetaling
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="font-bold text-amber-400">14–30 dagen</p>
            <p className="mt-2 text-sm text-amber-900/80">
              Gedeeltelijke terugbetaling
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-6">
            <p className="font-bold text-red-950">Minder dan 14 dagen</p>
            <p className="mt-2 text-sm text-red-900/80">
              Geen terugbetaling
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — FAQ */}
      <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0b100e] to-[#0a0a0a] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Veelgestelde vragen
          </h2>
          <div className="mt-10 divide-y divide-gray-800 rounded-2xl border border-gray-800 bg-[#111827]">
            {faq.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-left font-semibold text-white outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {item.q}
                    <svg
                      className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
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
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Contact CTA */}
      <section className="bg-[#0a0a0a] px-4 py-14 text-center text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Nog vragen?</h2>
          <p className="mt-3 text-gray-400">
            Ons team staat voor je klaar. We reageren binnen 24 uur op werkdagen.
          </p>
          <a
            href="mailto:hallo@bookadj.nl"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#111827] px-7 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0f172a]/80"
          >
            <Mail className="mr-2 h-5 w-5" strokeWidth={1.75} aria-hidden />
            hallo@bookadj.nl
          </a>
          <div className="mt-8">
            <Link
              href="/zoeken"
              className="text-sm font-semibold text-green-400 underline underline-offset-4"
            >
              Of: bekijk DJ’s
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

