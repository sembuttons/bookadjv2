import { Suspense } from "react";
import { BerichtenClient } from "./berichten-client";
import { EnsurePublicUserRow } from "@/components/EnsurePublicUserRow";

export default function BerichtenPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-gray-400">Laden…</div>
      }
    >
      <EnsurePublicUserRow>
        <BerichtenClient />
      </EnsurePublicUserRow>
    </Suspense>
  );
}
