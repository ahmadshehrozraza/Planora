import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="size-4 mr-2" />
        Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-12">Last updated: February 2026</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Data Collection</h2>
          <p>
            At Planora, we collect minimal data required to provide you with the best project management experience. This includes your email address, profile information, and the GitHub username you link for integration purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use of Information</h2>
          <p>
            Your workspace data, including tasks, effort points, and activity logs, is strictly used to generate your analytics (like Velocity Tracking and Cumulative Flow) and is never shared with third-party advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. GitHub Integration</h2>
          <p>
            When you connect your GitHub account, we only receive webhook events (like Pull Requests and commits) to automatically update your task statuses. We do not require or request read/write access to your private codebase.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your agile workflows and project data from unauthorized access or disclosure.
          </p>
        </section>
      </div>
    </div>
  );
}