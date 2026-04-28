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

        <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border/50 bg-black shadow-2xl overflow-hidden relative aspect-video ring-1 ring-white/10">
          
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20 z-10 pointer-events-none" />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <iframe 
              className="w-[115%] h-[115%] object-cover pointer-events-none scale-[1.15]"
              src="https://www.youtube.com/embed/A3GIWJvWqaM?autoplay=1&mute=1&loop=1&controls=0&playlist=A3GIWJvWqaM&showinfo=0&modestbranding=1&disablekb=1&iv_load_policy=3" 
              title="Planora Platform Demo" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};