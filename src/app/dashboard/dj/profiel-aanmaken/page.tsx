import Link from "next/link";

export default function DjProfielAanmakenPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        DJ-profiel aanmaken
      </h1>
      <p className="mt-1 max-w-xl text-sm text-neutral-600">
        Hier kun je straks je profiel invullen om zichtbaar te worden voor klanten
        en boekingen te ontvangen.
      </p>
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-600">
        <p>De profielwizard volgt — gebruik ondertussen je profielpagina.</p>
        <Link
          href="/dashboard/dj/profiel"
          className="mt-4 inline-flex rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-900"
        >
          Naar mijn profiel
        </Link>
      </div>
    </div>
  );
}
