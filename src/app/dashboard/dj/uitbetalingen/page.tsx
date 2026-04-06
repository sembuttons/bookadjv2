import { Wallet } from "lucide-react";

const SIDE_IMG =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80&auto=format&fit=crop";

export default function DjUitbetalingenPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Uitbetalingen
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Overzicht van uitbetalingen en vrijgavemomenten komt hier.
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
              <Wallet className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-lg font-semibold">Nog geen transacties</p>
            <p className="text-sm leading-relaxed text-slate-600">
              Zodra je eerste boeking is afgerond, zie je hier uitbetalingen en
              status. Vragen over betalingen? Mail{" "}
              <a
                href="mailto:hallo@bookadj.nl"
                className="font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
              >
                hallo@bookadj.nl
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
