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
          className="group rounded-xl border border-gray-800 bg-[#111827] shadow-sm open:border-l-2 open:border-l-green-500 open:border-gray-800 open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-white [&::-webkit-details-marker]:hidden">
            <span className="pr-2">{item.question}</span>
            <Chevron className="shrink-0 text-green-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t border-gray-800 px-5 py-4 text-sm leading-relaxed text-gray-400">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
