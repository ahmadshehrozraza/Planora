import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingFeatures } from "./landing-features";
import { LandingViews } from "./landing-views";
import { LandingAnalytics } from "./landing-analytics";
import { LandingCTA } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingViews />
        <LandingAnalytics />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}