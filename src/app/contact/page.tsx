import { ContactForm } from "@/components/contact/contact-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Clock, Sparkles, HelpCircle, BookOpen } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: 'Contact Us | RepurposeAI',
  description: 'Get in touch with RepurposeAI support team. We are here to help you with any questions about AI-powered content repurposing.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about RepurposeAI? We're here to help! Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Multiple ways to reach our team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">General Support</h4>
                    <a href="mailto:support@repurposeai.com" className="text-sm text-primary hover:underline">
                      support@repurposeai.com
                    </a>
                    <p className="text-xs text-muted-foreground">For technical support and general inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Sales & Business</h4>
                    <a href="mailto:sales@repurposeai.com" className="text-sm text-primary hover:underline">
                      sales@repurposeai.com
                    </a>
                    <p className="text-xs text-muted-foreground">For pricing, plans, and business inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Response Time</h4>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    <p className="text-xs text-muted-foreground">Typically much faster during business hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">How do I get started?</h4>
                  <p className="text-xs text-muted-foreground">
                    Sign up for a plan, connect your accounts, and start repurposing content in minutes. Check our <Link href="/#faq" className="text-primary hover:underline">FAQ</Link> for more details.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">What plans do you offer?</h4>
                  <p className="text-xs text-muted-foreground">
                    We offer Pro monthly subscriptions and Lifetime Deal tiers. <Link href="/pricing" className="text-primary hover:underline">View pricing</Link> for detailed information.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Do you offer refunds?</h4>
                  <p className="text-xs text-muted-foreground">
                    Yes! Contact us within 30 days if you're not satisfied and we'll process your refund.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">
            Other Ways to Get Help
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Help Center</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse articles and guides to get started
                  </p>
                  <Link
                    href="/help"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Visit Help Center →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">FAQ</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Find answers to commonly asked questions
                  </p>
                  <Link
                    href="/#faq"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View FAQ →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Feature Requests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your ideas for new features
                  </p>
                  <a 
                    href="mailto:feedback@repurposeai.com"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Send Feedback →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
