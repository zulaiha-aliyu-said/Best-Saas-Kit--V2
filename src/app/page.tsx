import Navigation from "@/components/landing/navigation"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import HowItWorks from "@/components/landing/how-it-works"
import UseCases from "@/components/landing/use-cases"
import Pricing from "@/components/landing/pricing"
import { auth } from "@/lib/auth"
import Testimonials from "@/components/landing/testimonials"
import FAQ from "@/components/landing/faq"
import Footer from "@/components/landing/footer"
import { SmoothScroll } from "@/components/ui/smooth-scroll"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen">
      <SmoothScroll />
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Pricing isAuthenticated={isAuthenticated} />
      <Testimonials />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
