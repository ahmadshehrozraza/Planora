import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Menu,
  Activity,
  Layers,
  PieChart,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlanoraLogo } from "@/components/planora-logo"; 
import { redirect } from "next/navigation";
import { getWorkspaces } from "@/features/workspaces/server/useGetWorkspace";

const features = [
  {
    title: "Custom Kanban Boards",
    description:
      "Build your own workflows. Drag and drop tasks across custom columns designed for your team's unique process.",
    icon: KanbanSquare,
  },
  {
    title: "Interactive Data Calendar",
    description:
      "Visualize your deadlines with a powerful calendar view. Never miss a project milestone or task due date.",
    icon: CalendarDays,
  },
  {
    title: "Workspace Isolation",
    description:
      "Keep teams and projects organized in dedicated workspaces with strictly controlled environments.",
    icon: LayoutDashboard,
  },
  {
    title: "Role-Based Access",
    description:
      "Granular control with Admin, Project Manager, and Member roles. Secure your data with precision.",
    icon: ShieldCheck,
  },
  {
    title: "Team Collaboration",
    description:
      "Assign tasks, leave comments, and communicate seamlessly within task cards and project segments.",
    icon: Users,
  },
  {
    title: "Real-time Analytics",
    description:
      "Track progress, monitor workload, and make data-driven decisions with built-in analytical insights.",
    icon: Zap,
  },
];

const analyticsFeatures = [
  {
    name: "Velocity Tracking",
    highlight: "Capacity Planning",
    description: "Monitor daily created vs. completed tasks to measure your team's true capacity and prevent scope creep.",
    features: [
      "Daily throughput analysis",
      "Scope creep detection",
      "7-day trend visualization",
      "Workspace-wide overview"
    ],
    icon: Activity,
  },
  {
    name: "Cumulative Flow",
    highlight: "Bottleneck Detection",
    description: "Visualize task statuses over time. Instantly identify bottlenecks in your workflow before they derail the project.",
    features: [
      "Stacked area charts",
      "Status distribution",
      "Historical trend analysis",
      "Blocker identification"
    ],
    icon: Layers,
    popular: true,
  },
  {
    name: "Performance Matrix",
    highlight: "Team Gamification",
    description: "Gamify work with Effort Points. Track individual member efficiency and contribution across the entire workspace.",
    features: [
      "Effort Points scoring",
      "Efficiency percentage",
      "Task completion tracking",
      "Role-based performance"
    ],
    icon: PieChart,
  },
];

export default async function LandingPage() {
  const workspacesData = await getWorkspaces();
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-2 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlanoraLogo 
                  fontFamily="outfit"
                  wheelSize={50}
                  wheelHandWidth={3}
                  animateText={false}
                  className="" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#views"
              className="hover:text-foreground transition-colors"
            >
              Views
            </Link>
            <Link
              href="#analytics"
              className="hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-8">
              <ThemeToggle />
            </div>
            <Link
              href="/sign-in"
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Button asChild size="sm" className="shadow-sm">
              <Link href={workspacesData?.documents?.[0] ? `/workspaces/${workspacesData.documents[0].id}` : '/sign-up'}>
                Get Started
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-background to-background z-0" />

          <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
            <Badge
              variant="outline"
              className="mb-6 px-3 py-1 border-primary/30 bg-primary/10 text-primary"
            >
              100% Free & Open Source
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance max-w-4xl mx-auto mb-6">
              Manage projects, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                master your time.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              Planora is the ultimate free workspace for your team. Build custom
              workflows, track effort points, visualize bottlenecks, and
              ship products faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base"
              >
                <Link href="/sign-up">
                  Start for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base border-border bg-background hover:bg-muted"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>

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
                <div className="col-span-1 border border-border bg-card rounded-lg hidden md:block" />
                <div className="col-span-4 md:col-span-3 border border-border bg-card rounded-lg flex flex-col p-4 gap-4">
                  <div className="h-8 w-1/3 bg-muted rounded-md" />
                  <div className="flex gap-4">
                    <div className="h-64 flex-1 bg-muted/50 rounded-md border border-border" />
                    <div className="h-64 flex-1 bg-muted/50 rounded-md border border-border" />
                    <div className="h-64 flex-1 bg-muted/50 rounded-md border border-border" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-card">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need to scale
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built from the ground up for modern teams. Planora adapts to
                your workflow, not the other way around.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-background hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="size-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="views" className="py-24">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Multiple Views
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  See your work, your way
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Switch seamlessly between Data Tables, Kanban Boards, and
                  Calendars. Every task, project, and deadline is perfectly
                  synchronized across all views.
                </p>
                <ul className="space-y-4">
                  {[
                    "Customizable Kanban columns for agile teams",
                    "Detailed data tables with powerful filtering",
                    "Interactive calendar for milestone tracking",
                    "Real-time sync across all team members",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                      <span className="text-foreground font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
                <div className="border border-border bg-card rounded-2xl p-6 shadow-xl relative z-10">
                  <div className="flex gap-2 mb-6">
                    <div className="px-4 py-1.5 rounded-md bg-background border border-border text-sm font-medium shadow-sm">
                      Table
                    </div>
                    <div className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-sm">
                      Kanban
                    </div>
                    <div className="px-4 py-1.5 rounded-md bg-background border border-border text-sm font-medium shadow-sm">
                      Calendar
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border min-h-[300px]">
                      <div className="h-6 w-20 bg-muted rounded mb-3" />
                      <div className="space-y-2">
                        <div className="h-16 w-full bg-background rounded border border-border shadow-sm" />
                        <div className="h-16 w-full bg-background rounded border border-border shadow-sm" />
                      </div>
                    </div>
                    <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border min-h-[300px]">
                      <div className="h-6 w-24 bg-muted rounded mb-3" />
                      <div className="space-y-2">
                        <div className="h-16 w-full bg-background rounded border border-border shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="analytics" className="py-24 bg-card border-t border-border">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Enterprise-grade Analytics, <span className="text-primary">for Free.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stop guessing. Make data-driven decisions with built-in advanced charts, gamified effort tracking, and PDF reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {analyticsFeatures.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col p-8 rounded-3xl border ${item.popular ? "border-primary shadow-lg bg-background" : "border-border bg-background"}`}
                >
                  {item.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        Most Powerful
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                      <item.icon className="size-6" />
                    </div>
                    <Badge variant="secondary" className="mb-3">{item.highlight}</Badge>
                    <h3 className="text-2xl font-bold mb-3">{item.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1 mt-4 border-t border-border/50 pt-6">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="h-20 w-full bg-muted/30 rounded-lg border border-border flex items-end justify-between p-2 gap-1 overflow-hidden mt-auto">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <div key={i} className="w-full bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 z-0" />
          <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to transform your workflow?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join teams already using Planora to manage their projects, tasks, and deadlines. No credit card required. No hidden fees.
            </p>
            <Button asChild size="lg" className="h-14 px-10 text-lg shadow-lg">
              <Link href="/sign-up">Start Using Planora Today</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <PlanoraLogo 
                  fontFamily="outfit"
                  wheelSize={50}
                  wheelHandWidth={3}
                  animateText={false}
                  className="" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The ultimate project management tool designed for agile teams
                and forward-thinking enterprises.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#views" className="hover:text-primary transition-colors">
                    Views
                  </Link>
                </li>
                <li>
                  <Link href="#analytics" className="hover:text-primary transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/your-github" className="hover:text-primary transition-colors">
                    Open Source
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Planora. Free and Open Source.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="text-sm cursor-pointer hover:text-foreground transition-colors">
                Twitter
              </span>
              <span className="text-sm cursor-pointer hover:text-foreground transition-colors">
                GitHub
              </span>
              <span className="text-sm cursor-pointer hover:text-foreground transition-colors">
                LinkedIn
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}