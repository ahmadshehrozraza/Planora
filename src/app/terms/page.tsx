import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="size-4 mr-2" />
        Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-12">Effective starting: February 2026</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Planora, you agree to comply with these Terms of Service. If you do not agree, please do not use our project management platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Acceptable Use</h2>
          <p>
            Planora is designed for agile teams to track tasks and velocity. You agree not to misuse the platform by attempting to manipulate the Effort Points system, spamming activity logs, or reverse-engineering the GitHub Webhook integrations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Workspace Ownership</h2>
          <p>
            The creator of a Workspace retains administrative control over it. Planora reserves the right to suspend accounts that violate our community guidelines or disrupt the service for other users.
          </p>
        </section>
      </div>
    </div>
  );
}