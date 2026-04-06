import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  MessageCircleQuestionMark,
  UserX,
} from "lucide-react";

const cards = [
  {
    href: "/vragen-over-boeking",
    title: "Vragen over je boeking",
    description: "Alles over aanvragen, bevestigen en je evenement.",
    Icon: MessageCircleQuestionMark,
  },
  {
    href: "/betalingen-en-terugbetalingen",
    title: "Betalingen & terugbetalingen",
    description: "Hoe betalen werkt en wanneer je geld terugkrijgt.",
    Icon: CreditCard,
  },
  {
    href: "/als-dj-annuleert",
    title: "DJ annuleert",
    description: "Wat we doen bij annulering en hoe vervanging werkt.",
    Icon: UserX,
  },
] as const;

export function DjHelpSection() {
  return (
    <section aria-labelledby="help-heading">
      <h2
        id="help-heading"
        className="text-xl font-bold text-white sm:text-2xl"
      >
        Hulp nodig?
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map(({ href, title, description, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-2xl border border-gray-800 bg-[#111827] p-5 shadow-sm transition-all duration-200 hover:border-green-500/25 hover:shadow-md"
            >
              <Icon
                className="h-8 w-8 text-white"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="mt-4 font-semibold text-white">{title}</p>
              <p className="mt-2 flex-1 text-sm text-gray-400">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Meer info
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-gray-800 bg-[#0f172a] p-6 text-center shadow-sm sm:p-8">
        <p className="text-base font-semibold text-white">
          Kom je er niet uit? Neem contact op met ons team.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          We reageren binnen 24 uur op werkdagen.
        </p>
        <a
          href="mailto:hallo@bookadj.nl"
          className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gray-800 px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-700 sm:w-auto"
        >
          hallo@bookadj.nl
        </a>
      </div>
    </section>
  );
}
