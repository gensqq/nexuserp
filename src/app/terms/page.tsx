import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">ADN&apos;s Tech</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ADN&apos;s Tech (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ADN&apos;s Tech is a cloud-based Enterprise Resource Planning (ERP) platform that provides business management tools including but not limited to: Point of Sale, Customer Relationship Management, Accounting, Human Resources, Project Management, Inventory Management, and Reporting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service for any unlawful purpose, to violate any applicable laws, to transmit harmful code, or to interfere with the Service&apos;s operation. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Payment and Billing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Data Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to your data. We do not sell, share, or use your data for purposes other than providing the Service. You may export your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. We will notify you of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at support@adnstech.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
