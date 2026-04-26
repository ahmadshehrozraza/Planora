import { LayoutDashboard, KanbanSquare, CalendarDays, ShieldCheck, Github, Sparkles } from "lucide-react";

const features = [
  { title: "AI-Powered Predictions", description: "Our Scikit-Learn models predict project delays, calculate budget risks, and suggest effort points in real-time.", icon: Sparkles },
  { title: "GitHub Sync", description: "Link repositories to projects. Automatically track branches, commits, and pull requests directly inside task cards.", icon: Github },
  { title: "Custom Kanban Boards", description: "Build your own workflows. Drag and drop tasks across custom columns designed for your team's unique process.", icon: KanbanSquare },
  { title: "Interactive Data Calendar", description: "Visualize your deadlines with a powerful calendar view. Never miss a project milestone or task due date.", icon: CalendarDays },
  { title: "Workspace Isolation", description: "Keep teams and projects organized in dedicated workspaces with strictly controlled environments.", icon: LayoutDashboard },
  { title: "Role-Based Access", description: "Granular control with Admin, Project Manager, and Member roles. Secure your data with precision.", icon: ShieldCheck },
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Built from the ground up for modern software teams. Integrates AI and Git to adapt to your workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-border bg-background hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="size-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};