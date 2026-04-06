import Link from "next/link";

export default function DjNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 font-sans text-center">
      <h1 className="text-2xl font-bold text-ink">DJ niet gevonden</h1>
      <p className="mt-2 text-ink-secondary">
        Dit profiel bestaat niet of is niet zichtbaar.
      </p>
      <Link
        href="/zoeken"
        className="mt-6 text-sm font-semibold text-ink underline"
      >
        Naar zoeken
      </Link>
    </div>
  );
}
