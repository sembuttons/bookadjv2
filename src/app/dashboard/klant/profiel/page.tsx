import { Sparkles } from "lucide-react";

const SIDE_IMG =
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=800&q=80&auto=format&fit=crop";

export default function KlantProfielPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Profiel
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Beheer je gegevens en voorkeuren — deze pagina wordt binnenkort
        uitgebreid.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[180px] md:min-h-[240px]">
            <img
              src={SIDE_IMG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              width={800}
              height={600}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 text-slate-900 md:p-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600">
              <Sparkles className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-lg font-semibold">Jouw account</p>
            <p className="text-sm leading-relaxed text-slate-600">
              Wil je je naam of e-mail wijzigen? Neem contact op via{" "}
              <a
                href="mailto:info@bookadj.nl"
                className="font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
              >
                info@bookadj.nl
              </a>{" "}
              — we helpen je verder.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
