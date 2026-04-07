import { PaymentLogosRow } from "@/components/PaymentLogos";

type Props = {
  /** Light pills on light bg, or frosted pills on dark footer */
  variant?: "light" | "dark";
  /** Add Stripe next to iDEAL / cards */
  showStripe?: boolean;
  className?: string;
};

export function PaymentMethodBadges({
  variant = "light",
  showStripe = false,
  className = "",
}: Props) {
  void showStripe;
  return <PaymentLogosRow variant={variant} className={className} />;
}
