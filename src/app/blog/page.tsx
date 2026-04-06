import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing-page-shell";

export const metadata = {
  title: "Blog — bookadj",
  description: "Tips en nieuws over het boeken van DJ’s en evenementen.",
};

export default function BlogPage() {
  return (
    <MarketingPageShell maxWidth="medium">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Blog
      </h1>
      <p className="mt-4 text-base leading-relaxed text-gray-400">
        Hier publiceren we binnenkort artikelen over het boeken van DJ’s,
        trends in live muziek en praktische tips voor organisatoren.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-gray-800 bg-[#0f172a] p-8 text-center">
        <p className="text-sm text-gray-400">
          Nog geen artikelen — kom later terug of{" "}
          <Link href="/zoeken" className="font-semibold text-green-400 underline">
            zoek direct een DJ
          </Link>
          .
        </p>
      </div>
    </MarketingPageShell>
  );
}
