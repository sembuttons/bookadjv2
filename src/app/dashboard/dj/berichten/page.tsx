"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DjBerichtenRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/berichten");
  }, [router]);
  return (
    <p className="text-sm text-neutral-600">Doorsturen naar berichten…</p>
  );
}
