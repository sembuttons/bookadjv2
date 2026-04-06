import { Navbar } from "@/components/Navbar";
import { HowItWorksClient } from "./how-it-works-client";

export default function HoeHetWerktPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white">
      <Navbar />
      <HowItWorksClient />
    </div>
  );
}
