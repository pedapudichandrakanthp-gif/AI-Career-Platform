import Link from "next/link";

import { ArrowRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main role="main" className="page-main">
      <section className="page-container">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowRight size={16} className="rotate-180" />
            Back to Home
          </Link>

          <h1 className="page-title">Privacy Policy</h1>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold">1. Information We Collect</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                AvsarGrid collects information you provide directly, including your name, email address, and resume content when you use our services. We also collect technical data such as IP address, browser type, and device information for security and analytics purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                We use your information to provide exam eligibility matching services, analyze your profile for exam recommendations, improve our platform, and communicate with you about your account. Your profile data is processed by AI to generate personalized insights and exam matches.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Data Security</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                We implement industry-standard security measures to protect your data. Your information is encrypted in transit and at rest. We use secure authentication providers and limit access to your data to authorized personnel only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Third-Party Services</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                We use third-party services including Supabase for database management and Groq for AI processing. These services have their own privacy policies and data handling practices. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Your Rights</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                You have the right to access, correct, or delete your personal data. You can export your data or request account deletion at any time through your account settings or by contacting our support team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Cookies and Tracking</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                We use cookies and similar technologies to improve your experience, analyze usage patterns, and personalize content. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Contact Us</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                If you have questions about this Privacy Policy or our data practices, please contact us at privacy@avsargrid.com.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
