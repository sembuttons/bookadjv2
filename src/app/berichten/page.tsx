import { Suspense } from "react";
import { BerichtenClient } from "./berichten-client";

export default function BerichtenPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-ink-secondary">Laden…</div>
      }
    >
      <BerichtenClient />
    </Suspense>
  );
}
