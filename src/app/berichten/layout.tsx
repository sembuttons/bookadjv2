import Link from "next/link";

export default function BerichtenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="border-b border-white/10 bg-black text-white shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white"
          >
            bookadj
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-white/90">
            <Link href="/zoeken" className="hover:text-white">
              DJ&apos;s vinden
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Berichten
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Veilige berichten binnen bookadj — deel geen telefoonnummers of
          betaalverzoeken.
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
