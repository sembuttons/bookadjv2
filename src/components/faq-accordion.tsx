import type { ReactNode } from "react";

export type FaqItem = { question: string; answer: ReactNode };

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details
          key={i}
          className="group rounded-xl border border-neutral-200 bg-white shadow-sm open:border-neutral-300 open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
            <span className="pr-2">{item.question}</span>
            <Chevron className="shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t border-neutral-100 px-5 py-4 text-sm leading-relaxed text-neutral-600">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
