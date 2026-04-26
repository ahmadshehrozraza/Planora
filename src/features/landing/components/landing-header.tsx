"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlanoraLogo } from "@/components/planora-logo";

export const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-2 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlanoraLogo fontFamily="outfit" wheelSize={50} wheelHandWidth={3} animateText={false} />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#views" className="hover:text-foreground transition-colors">Views</Link>
          <Link href="#analytics" className="hover:text-foreground transition-colors">Analytics</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="w-8"><ThemeToggle /></div>
          <Link href="/sign-in" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};