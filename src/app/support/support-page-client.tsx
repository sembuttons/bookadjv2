"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Hoe boek ik een DJ via bookadj?",
    a: "Zoek een DJ op datum en gelegenheid, stuur een aanvraag met je wensen en betaal veilig zodra de DJ je boeking accepteert. Alles loopt via het platform.",
  },
  {
    q: "Wanneer wordt mijn betaalmethode belast?",
    a: "In de regel pas nadat de DJ je aanvraag heeft geaccepteerd. Zo betaal je niet voor een aanvraag die wordt afgewezen.",
  },
  {
    q: "Kan ik annuleren als klant?",
    a: "Ja, volgens ons terugbetalingsbeleid — afhankelijk van hoe ver je evenement nog weg is. Zie de pagina Betalingen en terugbetalingen voor de richtlijnen.",
  },
  {
    q: "Wat als mijn DJ annuleert?",
    a: "We proberen een passende vervangende DJ te vinden. Lukt dat niet tijdig, dan streven we naar een volledige terugbetaling volgens het beleid.",
  },
  {
    q: "Hoe werkt verificatie van DJ’s?",
    a: "DJ’s doorlopen ID- en bedrijfscontrole en Stripe KYC voordat ze als geverifieerd op het platform staan.",
  },
  {
    q: "Waar vind ik mijn berichten en boekingen?",
    a: "Log in en open je dashboard (klant of DJ). Boekingen en berichten staan daar gecentraliseerd.",
  },
  {
    q: "Problemen met betaling of uitbetaling?",
    a: "Neem contact op met support via het formulier hieronder of mail hallo@bookadj.nl met je boekingsreferentie.",
  },
  {
    q: "Hoe meld ik een geschil?",
    a: "Gebruik de pagina Hulp bij problemen of mail ons met een duidelijke beschrijving en eventuele screenshots.",
  },
] as const;

export function SupportFaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-all duration-200"
          >
            <button
              type="button"
              className="flex w-full min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-ink md:px-5 md:py-4 md:text-base"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.q}
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="border-t border-line/60 px-4 py-3 text-sm leading-relaxed text-ink-secondary md:px-5 md:py-4">
                {item.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function SupportContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg(null);
    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          _gotcha: hp,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrMsg(data.error ?? "Er ging iets mis.");
        setStatus("err");
        return;
      }
      setStatus("ok");
      setMessage("");
    } catch {
      setErrMsg("Netwerkfout. Probeer opnieuw of mail hallo@bookadj.nl.");
      setStatus("err");
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm md:p-8"
    >
      <h2 className="text-lg font-bold text-ink md:text-xl">
        Contact opnemen
      </h2>
      <p className="text-sm text-ink-secondary">
        Vul het formulier in. We beantwoorden je bericht zo snel mogelijk.
      </p>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Naam</span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
          autoComplete="name"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">E-mail</span>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Bericht</span>
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field min-h-[140px]"
          required
          minLength={10}
          placeholder="Beschrijf je vraag of probleem…"
        />
      </label>
      <input
        type="text"
        name="_gotcha"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      {errMsg ? (
        <p className="text-sm text-danger" role="alert">
          {errMsg}
        </p>
      ) : null}
      {status === "ok" ? (
        <p className="text-sm font-medium text-bookadj-soft" role="status">
          Bedankt! Je bericht is verstuurd.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-line px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-line/80 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Versturen…" : "Verstuur bericht"}
      </button>
    </form>
  );
}
