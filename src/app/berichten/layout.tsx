import { BerichtenLayoutClient } from "./berichten-layout-client";

export default function BerichtenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BerichtenLayoutClient>{children}</BerichtenLayoutClient>;
}
