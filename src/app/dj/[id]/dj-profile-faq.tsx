"use client";

type Item = { q: string; a: string };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Betalingen",
    items: [
      {
        q: "Moet ik direct betalen?",
        a: "Je kaart wordt vastgehouden maar pas belast zodra de DJ accepteert.",
      },
      {
        q: "Kan ik betalen als bedrijf?",
        a: "Ja, je kunt een zakelijk e-mailadres en bedrijfsnaam opgeven bij het boeken.",
      },
      {
        q: "Kan ik een factuur ontvangen?",
        a: "Ja, na bevestiging ontvang je automatisch een betalingsbewijs per e-mail.",
      },
      {
        q: "Is mijn betaling veilig?",
        a: "Ja, alle betalingen verlopen via Stripe met 256-bit encryptie.",
      },
      {
        q: "Waarom rekent bookadj servicekosten?",
        a: "Wij zorgen voor verificatie, betalingsbescherming en support. De kosten zijn inbegrepen in het DJ tarief.",
      },
      {
        q: "Kan ik een aanbetaling doen?",
        a: "Nee, het volledige bedrag wordt vastgehouden bij aanvraag en vrijgegeven na het evenement.",
      },
    ],
  },
  {
    title: "Annuleringen",
    items: [
      {
        q: "Wat als ik annuleer?",
        a: "30+ dagen voor: volledig terug. 14-30 dagen: gedeeltelijk. Minder dan 14 dagen: geen terugbetaling.",
      },
      {
        q: "Wat als de DJ annuleert?",
        a: "Je krijgt volledig je geld terug en wij zoeken actief een vervanger.",
      },
      {
        q: "Hoe vraag ik terugbetaling aan?",
        a: "Via je dashboard onder de boeking, knop 'Terugbetaling aanvragen'.",
      },
      {
        q: "Wat als het aantal gasten verandert?",
        a: "Dat heeft geen invloed op de boeking. Bespreek dit direct met de DJ via het berichtencentrum.",
      },
    ],
  },
];

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DjProfileFaq() {
  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="text-xl font-bold text-ink sm:text-2xl"
      >
        Veelgestelde vragen
      </h2>
      <div className="mt-6 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              {section.title}
            </h3>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface px-1">
              {section.items.map((item) => (
                <details key={item.q} className="group px-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <Chevron className="shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-4 pt-0 text-sm leading-relaxed text-ink-secondary">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
