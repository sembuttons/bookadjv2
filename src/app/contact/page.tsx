import { ContactForm } from "./contact-form";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Contact — bookadj",
  description: "Neem contact op met bookadj.",
};

export default function ContactPage() {
  return (
    <MarketingPageShell maxWidth="medium">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-400">
        Support
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 text-gray-400">
        Vul het formulier in. Je bericht komt bij{" "}
        <a
          href="mailto:hallo@bookadj.nl"
          className="font-semibold text-white underline"
        >
          hallo@bookadj.nl
        </a>
        . We streven ernaar binnen enkele werkdagen te reageren.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </MarketingPageShell>
  );
}
