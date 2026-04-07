"use client";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { ManagedPlatforms } from "@/components/marketing/managed-platforms";
import { ValueProps } from "@/components/marketing/value-props";
import { MarketingFooter } from "@/components/marketing/footer";

export default function LandingPage() {
  // Completely overrides the original Dashboard-like content previously found here
  // Renders inside the global app/layout.tsx which has Providers, 
  // but WITHOUT the authenticated (app)/layout.tsx wrapper.
  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-primary/30">
      <MarketingHeader />
      
      <main>
        <HeroSection />
        <ManagedPlatforms />
        <ValueProps />
      </main>

      <MarketingFooter />
    </div>
  );
}
