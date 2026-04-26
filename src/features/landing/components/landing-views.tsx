"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const LandingViews = () => {
  const [activeView, setActiveView] = useState<"table" | "kanban" | "calendar">("kanban");

  return (
    <section id="views" className="py-24">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="secondary" className="mb-4">Multiple Views</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">See your work, your way</h2>
            <p className="text-lg text-muted-foreground mb-8">Switch seamlessly between Data Tables, Kanban Boards, and Calendars. Every task, project, and deadline is perfectly synchronized across all views.</p>
            <ul className="space-y-4">
              {["Customizable Kanban columns for agile teams", "Detailed data tables with powerful filtering", "Interactive calendar for milestone tracking", "Real-time sync across all team members"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
            <div className="border border-border bg-card rounded-2xl p-6 shadow-xl relative z-10 transition-all">
              <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveView("table")} className={`px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors ${activeView === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Table</button>
                <button onClick={() => setActiveView("kanban")} className={`px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors ${activeView === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Kanban</button>
                <button onClick={() => setActiveView("calendar")} className={`px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors ${activeView === 'calendar' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Calendar</button>
              </div>
              <div className="min-h-[300px] w-full">
                {activeView === "kanban" && (
                    <div className="flex gap-4 h-full animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="h-6 w-20 bg-muted rounded mb-3" />
                        <div className="space-y-2">
                            <div className="h-20 w-full bg-background rounded border border-border shadow-sm p-2 flex flex-col justify-between"><div className="h-2 w-1/2 bg-muted rounded"/><div className="h-4 w-6 bg-primary/20 rounded ml-auto"/></div>
                            <div className="h-20 w-full bg-background rounded border border-border shadow-sm p-2 flex flex-col justify-between"><div className="h-2 w-3/4 bg-muted rounded"/><div className="h-4 w-6 bg-primary/20 rounded ml-auto"/></div>
                        </div>
                        </div>
                        <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="h-6 w-24 bg-muted rounded mb-3" />
                        <div className="space-y-2">
                            <div className="h-20 w-full bg-background rounded border border-border shadow-sm p-2 flex flex-col justify-between"><div className="h-2 w-2/3 bg-muted rounded"/><div className="h-4 w-6 bg-primary/20 rounded ml-auto"/></div>
                        </div>
                        </div>
                    </div>
                )}
                {activeView === "table" && (
                    <div className="w-full bg-muted/30 rounded-lg border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-4 border-b border-border bg-muted/50 p-3">
                            <div className="h-3 w-16 bg-muted-foreground/30 rounded" />
                            <div className="h-3 w-12 bg-muted-foreground/30 rounded" />
                            <div className="h-3 w-20 bg-muted-foreground/30 rounded" />
                            <div className="h-3 w-10 bg-muted-foreground/30 rounded" />
                        </div>
                        {[1,2,3,4,5].map((i) => (
                        <div key={i} className="grid grid-cols-4 border-b border-border/50 p-3 bg-background hover:bg-muted/30">
                            <div className="h-3 w-full bg-muted rounded" />
                            <div className="h-3 w-1/2 bg-primary/20 rounded" />
                            <div className="h-3 w-2/3 bg-muted rounded" />
                            <div className="h-3 w-6 bg-emerald-500/20 rounded" />
                        </div>
                        ))}
                    </div>
                )}
                {activeView === "calendar" && (
                    <div className="w-full bg-background rounded-lg border border-border animate-in fade-in zoom-in-95 duration-300 flex flex-col p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="h-5 w-32 bg-muted rounded" />
                            <div className="h-6 w-20 bg-muted/50 rounded" />
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {[...Array(35)].map((_, i) => (
                                <div key={i} className={`h-10 rounded border ${i === 12 ? 'border-primary bg-primary/10' : 'border-border/50 bg-muted/10'} p-1`}>
                                    <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
                                    {i === 15 && <div className="mt-1 h-2 w-full bg-amber-500/50 rounded" />}
                                    {i === 16 && <div className="mt-1 h-2 w-full bg-blue-500/50 rounded" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};