import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          bookadj
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Pagina niet gevonden
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          De pagina die je zoekt bestaat niet (meer). Kies één van de opties
          hieronder.
        </p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-500 px-6 text-sm font-bold text-black transition-all duration-200 hover:bg-green-400"
          >
            Terug naar home
          </Link>
          <Link
            href="/zoeken"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-gray-50"
          >
            DJ&apos;s vinden
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-gray-50"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
