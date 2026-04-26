import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const LandingHero = () => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-background to-background z-0" />
      <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
        <Badge variant="outline" className="mb-6 px-3 py-1 border-primary/30 bg-primary/10 text-primary">
            <span className="flex">
                <Sparkles className="size-3 mr-1.5" /> AI-Powered Project Management
          </span>
        </Badge>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance max-w-4xl mx-auto mb-6">
          Manage projects, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            master your time.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
          Planora is the ultimate workspace for modern teams. Build custom workflows, track effort points, visualize bottlenecks with AI, and ship products faster.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
            <Link href="/sign-up">Start for free <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-border bg-background hover:bg-muted">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>

        {/* MOCKUP */}
        <div className="mt-20 mx-auto max-w-5xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 top-2/3" />
          <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-rose-500/80" />
              <div className="size-3 rounded-full bg-amber-500/80" />
              <div className="size-3 rounded-full bg-emerald-500/80" />
            </div>
          </div>
          <div className="p-4 bg-muted/10 grid grid-cols-4 gap-4 h-[400px]">
            <div className="col-span-1 border border-border bg-card rounded-lg hidden md:block p-4 space-y-3">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-full bg-muted/50 rounded" />
                <div className="h-4 w-2/3 bg-muted/50 rounded" />
            </div>
            <div className="col-span-4 md:col-span-3 border border-border bg-card rounded-lg flex flex-col p-4 gap-4">
              <div className="h-8 w-1/3 bg-muted rounded-md" />
              <div className="flex gap-4">
                <div className="h-64 flex-1 bg-muted/50 rounded-md border border-border shadow-sm p-3">
                    <div className="h-20 bg-background rounded border border-border mb-2" />
                    <div className="h-20 bg-background rounded border border-border" />
                </div>
                <div className="h-64 flex-1 bg-muted/50 rounded-md border border-border shadow-sm p-3">
                    <div className="h-20 bg-background rounded border border-border" />
                </div>
                <div className="h-64 flex-1 bg-muted/50 rounded-md border border-border shadow-sm p-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};