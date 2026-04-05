import Link from "next/link";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Reviews
        </h1>
        <p className="mt-4 text-neutral-600">
          Hier vind je binnenkort alle beoordelingen van bookadj-klanten en
          DJ&apos;s.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
