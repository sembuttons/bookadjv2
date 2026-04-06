import { Navbar } from "@/components/Navbar";
import { HowItWorksClient } from "./how-it-works-client";

export default function HoeHetWerktPage() {
  return (
    <div className="min-h-screen bg-app font-sans text-ink">
      <Navbar />
      <HowItWorksClient />
    </div>
  );
}
