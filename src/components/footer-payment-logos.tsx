import { PaymentLogosRow } from "@/components/PaymentLogos";

export function FooterPaymentLogos() {
  return (
    <div aria-label="Geaccepteerde betaalmethoden">
      <PaymentLogosRow variant="dark" className="gap-3" />
    </div>
  );
}
