import Link from "next/link";

import { ArrowRight } from "lucide-react";

export default function TermsPage() {
  return (
    <main role="main" className="page-main">
      <section className="page-container">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowRight size={16} className="rotate-180" />
            Back to Home
          </Link>

          <h1 className="page-title">Terms of Service</h1>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                By accessing or using AvsarGrid, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Description of Service</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                AvsarGrid is an AI-powered government exam platform that provides eligibility analysis, exam matching, and exam recommendations. We use artificial intelligence to analyze your profile and match you with relevant government exam opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. User Responsibilities</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information when creating your account. You must not use our service for any illegal or unauthorized purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Intellectual Property</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                All content, features, and functionality of AvsarGrid are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. User Content</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                You retain ownership of any content you upload to our service, including your resume and profile information. By uploading content, you grant us a license to use, process, and analyze it for the purpose of providing our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. AI-Generated Content</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Our AI-powered recommendations and analyses are provided for informational purposes only. We do not guarantee the accuracy or completeness of AI-generated content. You should verify all information independently before making career decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Disclaimer of Warranties</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                AvsarGrid is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee that our service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                To the fullest extent permitted by law, AvsarGrid shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Termination</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                We may update these terms from time to time. Continued use of our service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Contact Information</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                For questions about these Terms of Service, please contact us at legal@avsargrid.com.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
