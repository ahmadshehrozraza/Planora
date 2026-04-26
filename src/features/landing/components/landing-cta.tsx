import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 z-0" />
      <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your workflow?</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">Join teams already using Planora to manage their projects, tasks, and deadlines. No credit card required. No hidden fees.</p>
        <Button asChild size="lg" className="h-14 px-10 text-lg shadow-lg">
          <Link href="/sign-up">Start Using Planora Today</Link>
        </Button>
      </div>
    </section>
  );
};