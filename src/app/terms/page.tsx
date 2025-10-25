import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Scale, CreditCard, AlertCircle, Shield, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | RepurposeAI',
  description: 'Terms of Service for RepurposeAI - Legal terms and conditions for using our platform.',
}

export default function TermsOfServicePage() {
  const lastUpdated = "October 24, 2025"

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 mb-8">
            <p className="text-base leading-relaxed m-0">
              Welcome to RepurposeAI. By accessing or using our AI-powered content repurposing platform,
              you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">1. Acceptance of Terms</h2>
              </div>
            </div>

            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4">
                By creating an account or using RepurposeAI, you acknowledge that you have read, understood,
                and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <ul className="space-y-2 mb-0">
                <li>You must be at least 13 years old to use our services</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You agree to comply with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">2. Account Registration</h2>
              </div>
            </div>

            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Account Creation</h3>
              <ul className="space-y-2 mb-0">
                <li>Create an account using valid email credentials</li>
                <li>Choose an appropriate username and password</li>
                <li>Provide accurate billing information for paid plans</li>
                <li>Maintain the confidentiality of your account credentials</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Account Responsibilities</h3>
              <ul className="space-y-2 mb-0">
                <li>You are responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>One account per user (no account sharing)</li>
                <li>You may not transfer your account to another person</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">3. Pricing and Payment</h2>
              </div>
            </div>

            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Subscription Plans</h3>
              <ul className="space-y-2 mb-0">
                <li><strong>Pro Plan:</strong> Monthly/annual subscription with full features and unlimited credits</li>
                <li><strong>Lifetime Deal (LTD):</strong> One-time payment for lifetime access with tiered credits (50K to 1M credits/month)</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Credit System</h3>
              <ul className="space-y-2 mb-0">
                <li>Credits are consumed based on feature usage</li>
                <li>Different features consume different credit amounts</li>
                <li>Monthly credits reset at the beginning of each billing cycle</li>
                <li>LTD credits are allocated based on purchased tier</li>
                <li>Unused credits do not roll over (except for LTD plans)</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Billing</h3>
              <ul className="space-y-2 mb-0">
                <li>All payments are processed securely through our payment provider</li>
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>Refunds are provided according to our refund policy</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Lifetime Deal Terms</h3>
              <ul className="space-y-2 mb-0">
                <li>One-time payment provides lifetime access to the platform</li>
                <li>LTD terms apply to the purchased tier level</li>
                <li>LTD includes lifetime updates and support</li>
                <li>LTD does not include future premium tier features unless upgraded</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Service Features</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4">RepurposeAI provides the following features (availability depends on plan):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-0">
                <ul className="space-y-1 mb-0">
                  <li>✓ AI Content Repurposing</li>
                  <li>✓ AI Chat Assistant</li>
                  <li>✓ Viral Hooks Generator</li>
                  <li>✓ Competitor Analysis</li>
                  <li>✓ Trending Topics Discovery</li>
                  <li>✓ Content Scheduling</li>
                  <li>✓ Performance Analytics</li>
                  <li>✓ Style Training</li>
                </ul>
                <ul className="space-y-1 mb-0">
                  <li>✓ Content Templates</li>
                  <li>✓ Team Management</li>
                  <li>✓ Video Transcript Extraction</li>
                  <li>✓ File Content Extraction</li>
                  <li>✓ Email Newsletter Generation</li>
                  <li>✓ Account Management</li>
                  <li>✓ Usage Tracking</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">5. Acceptable Use Policy</h2>
              </div>
            </div>

            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">You agree NOT to:</h3>
              <ul className="space-y-2 mb-0">
                <li>Use the service for illegal activities</li>
                <li>Generate spam, malicious, or harmful content</li>
                <li>Violate intellectual property rights</li>
                <li>Attempt to bypass credit limits or abuse the system</li>
                <li>Reverse engineer or scrape our platform</li>
                <li>Share or resell your account access</li>
                <li>Upload malware, viruses, or harmful code</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Generate content that violates third-party terms (YouTube, Reddit, etc.)</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Content Guidelines</h3>
              <ul className="space-y-2 mb-0">
                <li>You retain ownership of content you create</li>
                <li>You grant us a license to process and display your content</li>
                <li>You are responsible for ensuring your content complies with applicable laws</li>
                <li>We reserve the right to remove content that violates these terms</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. AI Content and Accuracy</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <ul className="space-y-3 mb-0">
                <li>
                  AI-generated content is provided "as is" and may not always be accurate
                </li>
                <li>
                  You are responsible for reviewing and verifying all AI-generated content
                </li>
                <li>
                  We use third-party AI services for content processing - subject to their terms and limitations
                </li>
                <li>
                  Trending topics and competitor data are sourced from public sources and may not be comprehensive
                </li>
                <li>
                  Analytics and predictions are estimates and not guarantees of performance
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Your Content</h3>
              <ul className="space-y-2 mb-4">
                <li>You retain all rights to content you upload or create</li>
                <li>You grant us a license to process, store, and display your content to provide services</li>
                <li>You represent that you have rights to all content you upload</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Our Platform</h3>
              <ul className="space-y-2 mb-0">
                <li>RepurposeAI, our logo, and platform features are our intellectual property</li>
                <li>You may not copy, modify, or create derivative works</li>
                <li>Templates and AI-generated suggestions remain subject to our license</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">8. Service Availability</h2>
              </div>
            </div>

            <div className="bg-card/30 border rounded-lg p-6">
              <ul className="space-y-2 mb-0">
                <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance when possible</li>
                <li>We may modify or discontinue features with reasonable notice</li>
                <li>Third-party service outages may temporarily affect functionality</li>
                <li>We are not liable for service interruptions or data loss</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Termination</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">By You</h3>
              <ul className="space-y-2 mb-4">
                <li>You may cancel your subscription at any time</li>
                <li>You may delete your account from account settings</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">By Us</h3>
              <ul className="space-y-2 mb-0">
                <li>We may suspend or terminate accounts that violate these terms</li>
                <li>We may terminate service with 30 days notice</li>
                <li>Upon termination, your data will be deleted per our Privacy Policy</li>
                <li>LTD refunds are subject to our refund policy</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Disclaimers and Limitations</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4 font-semibold">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              </p>
              <ul className="space-y-2 mb-0">
                <li>We do not guarantee accuracy, completeness, or reliability of AI-generated content</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid in the last 12 months</li>
                <li>We are not responsible for third-party content or services</li>
              </ul>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-0">
                We may update these Terms of Service from time to time. We will notify you of material changes
                via email or platform notification. Continued use after changes constitutes acceptance of the
                updated terms.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>

            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-0">
                These Terms are governed by the laws of the jurisdiction in which RepurposeAI operates.
                Any disputes will be resolved through binding arbitration or in the courts of that jurisdiction.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="mb-3">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <ul className="space-y-2 mb-0 list-none pl-0">
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@repurposeai.com" className="text-primary hover:underline">
                    legal@repurposeai.com
                  </a>
                </li>
                <li>
                  <strong>Support:</strong>{' '}
                  <a href="mailto:support@repurposeai.com" className="text-primary hover:underline">
                    support@repurposeai.com
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
