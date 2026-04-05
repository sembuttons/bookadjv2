import { Suspense } from "react";
import { BerichtenClient } from "./berichten-client";

export default function BerichtenPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-neutral-600">Laden…</div>
      }
    >
      <BerichtenClient />
    </Suspense>
  );
}
