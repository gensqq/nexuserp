import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly: account details (name, email, company info), business data you enter (products, customers, transactions), and usage data (login times, feature usage) to improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to: provide and maintain the Service, process transactions, send important notifications, improve our features, and provide customer support. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored on secure servers with industry-standard encryption. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use third-party services (PayMongo for payments, Google Sheets for integration). These services have their own privacy policies. We only share the minimum data necessary for these integrations to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data for as long as your account is active. You may request data deletion at any time. Upon account termination, we will delete your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to: access your data, correct inaccurate data, delete your data, export your data, and opt out of non-essential communications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions, contact us at privacy@adnstech.com
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
