import Link from "next/link";
import { ArrowLeft, BookOpen, GitPullRequest, Kanban, BarChart3 } from "lucide-react";

export default function DocumentationPage() {
  const docsCategories = [
    {
      title: "Getting Started",
      description: "Learn how to set up your first workspace and invite team members.",
      icon: BookOpen,
      href: "#"
    },
    {
      title: "Kanban Boards",
      description: "Master task management, status updates, and customized views.",
      icon: Kanban,
      href: "#"
    },
    {
      title: "GitHub Integration",
      description: "Automatically move tasks to 'In Review' when a PR is opened.",
      icon: GitPullRequest,
      href: "#"
    },
    {
      title: "Analytics & Velocity",
      description: "Understand Effort Points, Cumulative Flow, and capacity planning.",
      icon: BarChart3,
      href: "#"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="size-4 mr-2" />
        Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
      <p className="text-xl text-muted-foreground mb-12">Everything you need to know about using Planora.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docsCategories.map((category, idx) => (
          <Link key={idx} href={category.href} className="group p-6 rounded-2xl border border-border bg-background hover:border-primary/50 hover:shadow-sm transition-all">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
              <category.icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}