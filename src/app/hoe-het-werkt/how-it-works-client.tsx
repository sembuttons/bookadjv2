"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  ThumbsUp,
  UserPlus,
  Wallet,
} from "lucide-react";

const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80";

const heroSocialProofAvatars = ["AD", "MK", "SV", "TB", "FA"] as const;

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
    desc: "Kies datum, tijd en locatie. Stuur je verzoek. De DJ heeft 24 uur om te reageren.",
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
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit mx-auto mt-8">
      <button
        type="button"
        onClick={() => onChange("klant")}
        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          value === "klant"
            ? "bg-green-500 text-black shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
        aria-pressed={value === "klant"}
      >
        Voor klanten
      </button>
      <button
        type="button"
        onClick={() => onChange("dj")}
        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          value === "dj"
            ? "bg-green-500 text-black shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
        aria-pressed={value === "dj"}
      >
        Voor DJ&apos;s
      </button>
    </div>
  );
}

function StepTimeline({ steps }: { steps: Step[] }) {
  return (
    <>
      {/* Desktop: horizontal connector */}
      <div className="relative mt-12 hidden lg:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {steps.map((s) => (
            <article
              key={s.n}
              className="flex flex-col border border-gray-200 rounded-2xl p-6 h-full bg-white shadow-sm"
            >
              {/* Top row - number + icon */}
              <div className="flex items-start justify-between mb-6">
                <span className="text-2xl font-black text-green-500">
                  {s.n}
                </span>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <s.Icon className="h-5 w-5 text-green-600" strokeWidth={1.75} aria-hidden />
                </div>
              </div>

              {/* Title - always at same height */}
              <p className="font-bold text-gray-900 text-base mb-2">
                {s.title}
              </p>

              {/* Description - fills remaining space */}
              <p className="text-gray-500 text-sm leading-relaxed flex-1">
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
                className="pointer-events-none absolute left-7 top-14 h-[calc(100%-1rem)] w-px bg-green-200"
                aria-hidden
              />
            ) : null}
            <article className="card-interactive flex gap-4 p-5">
              <div className="flex shrink-0 flex-col items-center">
                <span className="text-xl font-extrabold text-green-600">
                  {s.n}
                </span>
                <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-600 ring-1 ring-green-100">
                  <s.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
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
      {/* Hero - match /voor-djs style */}
      <section className="relative isolate overflow-hidden bg-[#0a0a0a] px-4 text-white sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(15,40,24,0.95) 100%), url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
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

        <div className="relative mx-auto max-w-5xl py-36 text-center md:py-48">
          <p className="mx-auto text-center text-green-400 text-xs font-semibold tracking-widest uppercase">
            HOE HET WERKT
          </p>

          <div className="relative mt-6">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(34,197,94,0.08), transparent)",
              }}
              aria-hidden
            />
            <h1 className="relative mx-auto font-black tracking-tight leading-none text-6xl md:text-8xl text-center">
              <span className="text-white">Zo werkt</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 font-black">
                bookadj.
              </span>
            </h1>
            <div
              className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full mx-auto mt-4"
              aria-hidden
            />
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-gray-400 text-lg md:text-xl">
            Van zoeken naar de perfecte DJ tot een onvergetelijk feest.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mt-8">
            {["Veilig betalen", "Geverifieerde DJ's", "Direct contact"].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-px h-8 bg-gradient-to-b from-green-500/0 to-green-500/60" />
            <ChevronDown className="w-5 h-5 text-green-500/60" aria-hidden />
          </div>
        </div>
      </section>

      {/* Section 1/2 steps */}
      <section
        id="stap-voor-stap"
        className="mx-auto max-w-7xl scroll-mt-24 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-600">
            {flow === "klant" ? "Voor klanten" : "Voor DJ's"}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Stap voor stap
          </h2>
          <p className="mt-3 text-slate-600">
            Duidelijk proces, premium ervaring, zonder verrassingen.
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-green-500" aria-hidden />

          <div className="mt-8 flex justify-center">
            <FlowToggle value={flow} onChange={setFlow} />
          </div>
        </div>

        <StepTimeline steps={steps} />
      </section>

      {/* Section 3 - betaalflow */}
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Betaalflow (in het kort)
            </h2>
            <p className="mt-3 text-slate-600">
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
                  <b.Icon className="h-6 w-6 text-green-600" strokeWidth={1.75} aria-hidden />
                  <p className="font-bold text-slate-900">{b.t}</p>
                  <p className="text-sm text-slate-600">{b.d}</p>
                </div>
                {i < 3 ? (
                  <div className="hidden justify-center lg:flex" aria-hidden>
                    <ArrowRight className="h-6 w-6 text-green-600" strokeWidth={2} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - FAQ */}
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Veelgestelde vragen
          </h2>
          <div className="mt-10 space-y-3 rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl px-4 py-4 transition-colors hover:bg-gray-50"
              >
                <summary className="cursor-pointer list-none text-left font-semibold text-slate-900 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {item.q}
                    <svg
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
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
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 - Contact CTA */}
      <section className="bg-[#f0fdf4] px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Nog vragen?</h2>
          <p className="mt-3 text-slate-600">
            Ons team staat voor je klaar. We reageren binnen 24 uur op werkdagen.
          </p>
          <a
            href="mailto:info@bookadj.nl"
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-7 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-gray-50"
          >
            <Mail className="mr-2 h-5 w-5 text-green-600" strokeWidth={1.75} aria-hidden />
            info@bookadj.nl
          </a>
          <div className="mt-8">
            <Link
              href="/zoeken"
              className="text-sm font-semibold text-green-600 underline underline-offset-4 hover:text-green-700"
            >
              Of: bekijk DJ’s
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

