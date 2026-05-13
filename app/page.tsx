import { HomeHeroSection } from "@/components/sections/HomeHeroSection";
import { MarketingShellLayout } from "@/components/layouts/MarketingShellLayout";

export default function HomePage() {
  return (
    <MarketingShellLayout>
      <HomeHeroSection />
    </MarketingShellLayout>
  );
}
