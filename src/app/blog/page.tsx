import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Blog - bookadj",
  description: "Tips en nieuws over het boeken van DJ’s en evenementen.",
};

export default function BlogPage() {
  return (
    <MarketingPageShell maxWidth="medium">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Blog
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        Hier publiceren we binnenkort artikelen over het boeken van DJ’s,
        trends in live muziek en praktische tips voor organisatoren.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-slate-600">
          Nog geen artikelen. Kom later terug of{" "}
          <Link
            href="/zoeken"
            className="font-semibold text-green-600 underline decoration-green-500/40 hover:text-green-700"
          >
            zoek direct een DJ
          </Link>
          .
        </p>
      </div>
    </MarketingPageShell>
  );
}
