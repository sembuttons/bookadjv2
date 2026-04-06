import { Sparkles } from "lucide-react";

const SIDE_IMG =
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=800&q=80&auto=format&fit=crop";

export default function KlantProfielPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Profiel
      </h1>
      <p className="mt-1 text-sm text-gray-400">
        Beheer je gegevens en voorkeuren — deze pagina wordt binnenkort
        uitgebreid.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-[#111827] shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[180px] md:min-h-[240px]">
            <img
              src={SIDE_IMG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              width={800}
              height={600}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 text-white md:p-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#111827]/15 text-white ring-2 ring-white/30">
              <Sparkles className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-lg font-semibold">Jouw account</p>
            <p className="text-sm leading-relaxed text-white/85">
              Wil je je naam of e-mail wijzigen? Neem contact op via{" "}
              <a
                href="mailto:hallo@bookadj.nl"
                className="font-semibold underline decoration-white/60"
              >
                hallo@bookadj.nl
              </a>{" "}
              — we helpen je verder.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
