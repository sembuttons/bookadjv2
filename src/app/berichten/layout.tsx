import { Navbar } from "@/components/Navbar";

export default function BerichtenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />
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
