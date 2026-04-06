"use client";

import { usePathname } from "next/navigation";
import { PageFade } from "@/components/page-fade";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <PageFade key={pathname}>{children}</PageFade>;
}
