import { Suspense } from "react";
import { BerichtenClient } from "./berichten-client";

export default function BerichtenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 items-center justify-center py-16 text-center text-gray-400">
            Laden…
          </div>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <BerichtenClient />
      </div>
    </Suspense>
  );
}
