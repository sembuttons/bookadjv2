import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Over ons — bookadj",
  description: "Missie en verhaal van bookadj.",
};

export default function OverOnsPage() {
  return (
    <MarketingPageShell maxWidth="medium">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Team bookadj
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Over ons
      </h1>

      <p className="mt-6 text-lg font-medium leading-relaxed text-neutral-800">
        bookadj is gebouwd voor DJ&apos;s die serieus zijn en klanten die
        zekerheid willen. Geen gedoe, geen onzekerheid — gewoon een betrouwbaar
        platform waar talent en gelegenheid elkaar vinden.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-neutral-900">Onze missie</h2>
        <p className="mt-4 text-neutral-600">
          Wij willen boeken van een DJ net zo eenvoudig en veilig maken als online
          shoppen: duidelijke profielen, transparante prijzen, betaling via het
          platform en support als er iets misgaat. Tegelijk geven wij DJ&apos;s
          een plek waar ze professioneel gezien worden — niet alleen als
          &quot;iemand met speakers&quot;, maar als ondernemers met een merk.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-neutral-900">Het bookadj-verhaal</h2>
        <div className="mt-4 space-y-4 text-neutral-600">
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

      <figure className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1571266028243-e631f2e28e4b?w=1200&q=80&auto=format&fit=crop"
          alt="Publiek bij een donker verlicht live-evenement"
          className="aspect-[16/9] w-full object-cover"
          width={1200}
          height={675}
          loading="lazy"
        />
        <figcaption className="border-t border-neutral-200 bg-white px-4 py-3 text-center text-sm text-neutral-600">
          Sfeerbeeld: waar bookadj voor staat — live muziek, energie en
          professionele uitvoering.{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline"
          >
            Unsplash
          </a>
        </figcaption>
      </figure>

      <section className="mt-12 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <h2 className="text-xl font-bold text-neutral-900">Het team</h2>
        <p className="mt-3 text-sm text-neutral-600">
          Hier komen binnenkort namen en rollen. Heb je zin om mee te bouwen?
          Mail{" "}
          <a
            href="mailto:hallo@bookadj.nl"
            className="font-semibold text-emerald-700 underline"
          >
            hallo@bookadj.nl
          </a>
          .
        </p>
      </section>
    </MarketingPageShell>
  );
}
