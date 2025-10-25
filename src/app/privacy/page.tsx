import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Database, UserCheck, FileText, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | RepurposeAI',
  description: 'Privacy Policy for RepurposeAI - How we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 mb-8">
            <p className="text-base leading-relaxed m-0">
              At RepurposeAI, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our AI-powered content repurposing platform.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">Information We Collect</h2>
              </div>
            </div>
            
            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <ul className="space-y-2 mb-0">
                <li>Name and email address (via secure authentication)</li>
                <li>Profile information and account credentials</li>
                <li>Payment information (processed securely)</li>
                <li>Subscription tier and credit usage data</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Content Data</h3>
              <ul className="space-y-2 mb-0">
                <li>Content you create, upload, or repurpose on our platform</li>
                <li>YouTube transcripts, file uploads (TXT, MD, HTML)</li>
                <li>AI-generated content and chat conversations</li>
                <li>Scheduled posts and analytics data</li>
                <li>Style training preferences and custom templates</li>
              </ul>
            </div>

            <div className="bg-card/30 border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
              <ul className="space-y-2 mb-0">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Service usage and feature patterns</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">How We Use Your Information</h2>
              </div>
            </div>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <ul className="space-y-3 mb-0">
                <li>
                  <strong>Service Delivery:</strong> To provide AI-powered content repurposing, trending topics analysis, 
                  and all platform features.
                </li>
                <li>
                  <strong>AI Processing:</strong> To process your content using secure third-party AI services for content generation 
                  and assistance.
                </li>
                <li>
                  <strong>Account Management:</strong> To manage your account, subscription, and billing.
                </li>
                <li>
                  <strong>Analytics & Improvements:</strong> To analyze usage patterns, improve features, and provide 
                  personalized recommendations.
                </li>
                <li>
                  <strong>Communication:</strong> To send important updates, notifications, and support responses.
                </li>
                <li>
                  <strong>Security:</strong> To protect against unauthorized access and fraudulent activity.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">Data Security</h2>
              </div>
            </div>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-2 mb-0">
                <li>Encrypted data transmission (SSL/TLS)</li>
                <li>Secure authentication systems</li>
                <li>Enterprise-grade secure database infrastructure</li>
                <li>PCI-compliant payment processing</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and data encryption at rest</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">Third-Party Services</h2>
              </div>
            </div>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4">
                We use trusted third-party services to operate our platform:
              </p>
              <ul className="space-y-3 mb-0">
                <li>
                  <strong>AI Services:</strong> For content generation and processing
                </li>
                <li>
                  <strong>Payment Processor:</strong> For secure payment processing and billing
                </li>
                <li>
                  <strong>Authentication Provider:</strong> For secure user authentication
                </li>
                <li>
                  <strong>Database Provider:</strong> For secure data storage
                </li>
                <li>
                  <strong>Cloud Hosting:</strong> For application hosting and deployment
                </li>
              </ul>
              <p className="mt-4 mb-0 text-sm text-muted-foreground">
                All third-party services are carefully selected for their security and privacy standards. 
                We only share information necessary to provide our services.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Data Rights</h2>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4">You have the right to:</p>
              <ul className="space-y-2 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your content and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p className="mb-0 text-sm">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@repurposeai.com" className="text-primary hover:underline">
                  privacy@repurposeai.com
                </a>
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <ul className="space-y-2 mb-0">
                <li>
                  <strong>Active Accounts:</strong> Data is retained while your account is active
                </li>
                <li>
                  <strong>Deleted Accounts:</strong> Data is deleted within 30 days of account deletion
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations
                </li>
                <li>
                  <strong>Backup Systems:</strong> Backup copies are removed within 90 days
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-4">We use cookies and similar technologies for:</p>
              <ul className="space-y-2 mb-0">
                <li>Authentication and session management</li>
                <li>Remembering user preferences</li>
                <li>Analytics and performance monitoring</li>
                <li>Security and fraud prevention</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-0">
                RepurposeAI is not intended for users under 13 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            
            <div className="bg-card/30 border rounded-lg p-6">
              <p className="mb-0">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date. Continued use of 
                our services after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-0 mb-3">Contact Us</h2>
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="mb-3">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="space-y-2 mb-0 list-none pl-0">
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@repurposeai.com" className="text-primary hover:underline">
                    privacy@repurposeai.com
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

