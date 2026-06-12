import HeroSection from "@/components/landing/HeroSection";
import InfluencerDiscoverySection from "@/components/landing/InfluencerDiscoverySection";
import AIMarketingSection from "@/components/landing/AIMarketingSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <HeroSection />
      <InfluencerDiscoverySection />
      <AIMarketingSection />
    </div>
  );
}
