import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Reviews
        </h1>
        <p className="mt-4 text-ink-secondary">
          Hier vind je binnenkort alle beoordelingen van bookadj-klanten en
          DJ&apos;s.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-line px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-line/80"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
