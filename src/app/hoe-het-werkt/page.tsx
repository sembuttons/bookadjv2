import { Navbar } from "@/components/Navbar";
import { HowItWorksClient } from "./how-it-works-client";

export default function HoeHetWerktPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar />
      <HowItWorksClient />
    </div>
  );
}
