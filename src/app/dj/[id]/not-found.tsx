import Link from "next/link";

export default function DjNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 font-sans text-center text-slate-900">
      <h1 className="text-2xl font-bold">DJ niet gevonden</h1>
      <p className="mt-2 text-slate-600">
        Dit profiel bestaat niet of is niet zichtbaar.
      </p>
      <Link
        href="/zoeken"
        className="mt-6 text-sm font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
      >
        Naar zoeken
      </Link>
    </div>
  );
}
