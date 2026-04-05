import { Suspense } from "react";
import { BerichtenClient } from "../berichten-client";

type PageProps = { params: Promise<{ userId: string }> };

export default async function BerichtenThreadPage({ params }: PageProps) {
  const { userId } = await params;
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-neutral-600">Laden…</div>
      }
    >
      <BerichtenClient initialPartnerId={userId} threadOnly />
    </Suspense>
  );
}
