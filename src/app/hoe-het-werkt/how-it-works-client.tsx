"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Search,
  UserPlus,
  Wallet,
} from "lucide-react";

type TabKey = "klant" | "dj";

const HERO_BG =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80&auto=format&fit=crop";
const SECTION_BG =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80&auto=format&fit=crop";

type Step = {
  n: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const klantSteps: Step[] = [
  {
    n: "01",
    title: "Zoek op datum en gelegenheid",
    desc: "Kies je datum en type feest. Je ziet geverifieerde DJ’s met transparante prijzen.",
    Icon: Search,
  },
  {
    n: "02",
    title: "Vergelijk profielen en stel een vraag",
    desc: "Bekijk stijl, reviews en tarieven. Twijfel je? Stuur veilig een bericht via bookadj.",
    Icon: MessageSquare,
  },
  {
    n: "03",
    title: "Boek met betalingsbescherming",
    desc: "Je betaalt veilig via het platform. In de regel wordt je kaart pas belast na acceptatie.",
    Icon: CreditCard,
  },
];

const djSteps: Step[] = [
  {
    n: "01",
    title: "Maak gratis een profiel",
    desc: "Vul je bio, tarieven, genres en gelegenheden in. Geen abonnementskosten.",
    Icon: UserPlus,
  },
  {
    n: "02",
    title: "Verificatie en livegang",
    desc: "Na controle (ID/KVK/KYC) ga je live als geverifieerde DJ. Dat verhoogt vertrouwen en conversie.",
    Icon: BadgeCheck,
  },
  {
    n: "03",
    title: "Ontvang aanvragen en plan je agenda",
    desc: "Alles op één plek: berichten, boekingen en beschikbaarheid. Jij focust op je set.",
    Icon: CalendarDays,
  },
  {
    n: "04",
    title: "Uitbetaling na afloop",
    desc: "Na afronding van het event wordt de betaling volgens afspraken verwerkt en uitbetaald.",
    Icon: Wallet,
  },
];

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 sm:flex-initial sm:px-6 ${
        active
          ? "bg-black text-white shadow-sm"
          : "bg-white/70 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function HowItWorksClient() {
  const [tab, setTab] = useState<TabKey>("klant");
  const steps = useMemo(() => (tab === "klant" ? klantSteps : djSteps), [tab]);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <section className="relative isolate overflow-hidden border-b border-neutral-200 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/90"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Hoe het werkt
          </p>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Boek een DJ zonder gedoe —{" "}
            <span className="text-emerald-200">veilig en transparant</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-neutral-200 sm:text-lg">
            Kies jouw flow: klant of DJ. In een paar duidelijke stappen weet je
            precies wat er gebeurt.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <TabButton active={tab === "klant"} onClick={() => setTab("klant")}>
              Voor klanten
            </TabButton>
            <TabButton active={tab === "dj"} onClick={() => setTab("dj")}>
              Voor DJ&apos;s
            </TabButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Stappenplan
          </h2>
          <p className="mt-3 text-neutral-600">
            Duidelijk, snel, en ontworpen voor vertrouwen.
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-bookadj" aria-hidden />
        </div>

        {/* Desktop timeline */}
        <div className="relative mt-12 hidden md:block">
          <div
            className="pointer-events-none absolute left-0 right-0 top-8 h-px bg-emerald-200"
            aria-hidden
          />
          <div
            className={`grid gap-6 ${
              steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
            }`}
          >
            {steps.map((s) => (
              <article
                key={s.n}
                className="card-interactive relative z-10 flex h-full flex-col p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-2xl font-extrabold tracking-tight text-emerald-600">
                    {s.n}
                  </span>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <s.Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-neutral-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {s.desc}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="mt-12 space-y-4 md:hidden">
          {steps.map((s, idx) => (
            <li key={s.n} className="relative">
              {idx < steps.length - 1 ? (
                <div
                  className="pointer-events-none absolute left-7 top-14 h-[calc(100%-1rem)] w-px bg-emerald-200"
                  aria-hidden
                />
              ) : null}
              <article className="card-interactive flex gap-4 p-5">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="text-xl font-extrabold text-emerald-600">
                    {s.n}
                  </span>
                  <span className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <s.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-neutral-900">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                    {s.desc}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative isolate overflow-hidden border-t border-neutral-200 bg-neutral-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url(${SECTION_BG})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/80 to-black/90"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                t: "Geverifieerde profielen",
                d: "DJ’s doorlopen checks voordat ze live gaan. Zo boek je met vertrouwen.",
              },
              {
                t: "Transparante prijzen",
                d: "Uurtarieven en indicaties zijn duidelijk. Geen verrassingen achteraf.",
              },
              {
                t: "Support binnen 24 uur",
                d: "Loop je vast? Mail ons of gebruik het supportformulier — we reageren snel op werkdagen.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-emerald-200">{x.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

