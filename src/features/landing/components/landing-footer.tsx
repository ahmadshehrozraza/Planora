import Link from "next/link";
import { PlanoraLogo } from "@/components/planora-logo";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <PlanoraLogo fontFamily="outfit" wheelSize={50} wheelHandWidth={3} animateText={false} />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">The ultimate AI-powered project management tool designed for agile teams and forward-thinking enterprises.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#views" className="hover:text-primary transition-colors">Views</Link></li>
              <li><Link href="#analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="https://github.com/ahmadshehrozraza" className="hover:text-primary transition-colors">Open Source</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Planora. Free and Open Source.</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="text-sm cursor-pointer hover:text-foreground transition-colors">Twitter</span>
            <span className="text-sm cursor-pointer hover:text-foreground transition-colors">GitHub</span>
            <span className="text-sm cursor-pointer hover:text-foreground transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};