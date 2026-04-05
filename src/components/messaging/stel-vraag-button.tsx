"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  djUserId: string;
  className?: string;
  children?: React.ReactNode;
};

export function StelVraagButton({ djUserId, className, children }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const path = `/berichten/${encodeURIComponent(djUserId)}`;
        if (!session) {
          router.push(
            `/auth?returnTo=${encodeURIComponent(path)}`,
          );
          return;
        }
        router.push(path);
      }}
    >
      {children ?? "Stel een vraag"}
    </button>
  );
}
