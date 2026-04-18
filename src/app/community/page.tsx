import Link from "next/link";
import { ArrowLeft, MessageSquare, Github, Twitter } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8 text-center">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-12">
        <ArrowLeft className="size-4 mr-2" />
        Back to Home
      </Link>
      
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Join the Planora Community</h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
        Connect with other developers, request new features, and share your Agile workflows with the community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="#" className="p-8 rounded-3xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all flex flex-col items-center">
          <MessageSquare className="size-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Discord Server</h3>
          <p className="text-sm text-muted-foreground">Chat with the team and users in real-time.</p>
        </a>

        <a href="#" className="p-8 rounded-3xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all flex flex-col items-center">
          <Github className="size-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">GitHub Discussions</h3>
          <p className="text-sm text-muted-foreground">Report bugs or contribute to the roadmap.</p>
        </a>

        <a href="#" className="p-8 rounded-3xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all flex flex-col items-center">
          <Twitter className="size-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Twitter / X</h3>
          <p className="text-sm text-muted-foreground">Follow for the latest updates and tips.</p>
        </a>
      </div>
    </div>
  );
}