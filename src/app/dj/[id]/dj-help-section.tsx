import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  MessageCircleQuestionMark,
  UserX,
} from "lucide-react";

const cards = [
  {
    href: "/support",
    title: "Vragen over je boeking",
    description: "Alles over aanvragen, bevestigen en je evenement.",
    Icon: MessageCircleQuestionMark,
  },
  {
    href: "/support/betalingen",
    title: "Betalingen & terugbetalingen",
    description: "Hoe betalen werkt en wanneer je geld terugkrijgt.",
    Icon: CreditCard,
  },
  {
    href: "/support/annulering",
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
        className="text-xl font-bold text-neutral-900 sm:text-2xl"
      >
        Hulp nodig?
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(({ href, title, description, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon
                className="h-8 w-8 text-neutral-900"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="mt-4 font-semibold text-neutral-900">{title}</p>
              <p className="mt-2 flex-1 text-sm text-neutral-600">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
                Meer info
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
