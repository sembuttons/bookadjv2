import { Suspense } from "react";
import { BerichtenClient } from "./berichten-client";

export default function BerichtenPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen overflow-hidden flex flex-col">
          <div className="flex-1 flex items-center justify-center py-16 text-center text-gray-400">
            Laden…
          </div>
        </div>
      }
    >
      <div className="h-screen overflow-hidden flex flex-col">
        <BerichtenClient />
      </div>
    </Suspense>
  );
}
