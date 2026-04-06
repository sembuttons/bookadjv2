import { MarketingPageShell } from "@/components/marketing-page-shell";
import {
  SupportContactForm,
  SupportFaqAccordion,
} from "./support-page-client";

export const metadata = {
  title: "Support — bookadj",
  description: "Veelgestelde vragen en contact met het bookadj-team.",
};

export default function SupportPage() {
  return (
    <MarketingPageShell maxWidth="wide">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Helpcentrum
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Support
      </h1>
      <p className="mt-4 max-w-2xl text-base text-neutral-600">
        Antwoorden op veelgestelde vragen en een directe lijn naar ons team.
      </p>

      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center md:p-8">
        <p className="text-sm font-semibold text-emerald-900 md:text-base">
          Mail ons op{" "}
          <a
            href="mailto:hallo@bookadj.nl"
            className="font-bold underline decoration-emerald-600 underline-offset-2"
          >
            hallo@bookadj.nl
          </a>{" "}
          — we reageren binnen 24 uur op werkdagen.
        </p>
      </div>

      <section className="mt-14" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-xl font-bold text-neutral-900 md:text-2xl"
        >
          Veelgestelde vragen
        </h2>
        <div className="mt-6">
          <SupportFaqAccordion />
        </div>
      </section>

      <section className="mt-14" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading" className="sr-only">
          Contactformulier
        </h2>
        <SupportContactForm />
      </section>
    </MarketingPageShell>
  );
}
