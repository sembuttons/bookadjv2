import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Over ons — bookadj",
  description: "Missie en verhaal van bookadj.",
};

export default function OverOnsPage() {
  return (
    <MarketingPageShell maxWidth="medium">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
        Team bookadj
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Over ons
      </h1>

      <p className="mt-6 text-lg font-medium leading-relaxed text-gray-700">
        bookadj is gebouwd voor DJ&apos;s die serieus zijn en klanten die
        zekerheid willen. Geen gedoe, geen onzekerheid — gewoon een betrouwbaar
        platform waar talent en gelegenheid elkaar vinden.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">Onze missie</h2>
        <p className="mt-4 text-gray-700">
          Wij willen boeken van een DJ net zo eenvoudig en veilig maken als online
          shoppen: duidelijke profielen, transparante prijzen, betaling via het
          platform en support als er iets misgaat. Tegelijk geven wij DJ&apos;s
          een plek waar ze professioneel gezien worden — niet alleen als
          &quot;iemand met speakers&quot;, maar als ondernemers met een merk.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">Het bookadj-verhaal</h2>
        <div className="mt-4 space-y-4 text-gray-700">
          <p>
            Ik ben ooit begonnen omdat ik zag hoe vaak het misging: afspraken via
            Instagram, geen contract, geen duidelijkheid over betaling — en aan
            beide kanten stress vlak voor het feest. Dat wilde ik anders.
          </p>
          <p>
            Samen met het team bouwen we bookadj stap voor stap: eerst
            vertrouwen (verificatie, reviews), daarna het hele traject van vraag
            tot uitbetaling op één plek. We zijn geen gigantisch agencykantoor;
            we zijn een klein team dat luistert naar DJ&apos;s én boekers.
          </p>
          <p>
            Of je nu een bruiloft plant of een clubnacht runt: wij geloven dat
            het kan zonder gedoe — als het platform de zware lifting doet.
          </p>
        </div>
      </section>

      <blockquote className="mt-12 rounded-2xl border border-gray-200 border-l-4 border-l-green-500 bg-white py-5 pl-6 pr-5 shadow-sm">
        <p className="text-base leading-relaxed text-gray-700">
          &ldquo;We bouwen bookadj voor iedereen die van live muziek houdt — en
          voor DJ&apos;s die hun vak serieus nemen.&rdquo;
        </p>
        <footer className="mt-3 text-sm font-semibold text-gray-900">
          — Founder, bookadj
        </footer>
      </blockquote>

      <figure className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1571266028243-e631f2e28e4b?w=1200&q=80&auto=format&fit=crop"
          alt="Publiek bij een donker verlicht live-evenement"
          className="aspect-[16/9] w-full object-cover"
          width={1200}
          height={675}
          loading="lazy"
        />
        <figcaption className="bg-white px-4 py-3 text-center text-sm text-slate-600">
          Sfeerbeeld: waar bookadj voor staat — live muziek, energie en
          professionele uitvoering.{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-600 underline decoration-green-500/40 hover:text-green-700"
          >
            Unsplash
          </a>
        </figcaption>
      </figure>

      <section className="mt-12 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Het team</h2>
        <p className="mt-3 text-sm text-gray-700">
          Hier komen binnenkort namen en rollen. Heb je zin om mee te bouwen?
          Mail{" "}
          <a
            href="mailto:hallo@bookadj.nl"
            className="font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
          >
            hallo@bookadj.nl
          </a>
          .
        </p>
      </section>
    </MarketingPageShell>
  );
}
