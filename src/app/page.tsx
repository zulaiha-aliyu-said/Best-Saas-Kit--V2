import Navigation from "@/components/landing/navigation"
import Hero from "@/components/landing/hero"
import Stats from "@/components/landing/stats"
import Features from "@/components/landing/features"
import HowItWorks from "@/components/landing/how-it-works"
import UseCases from "@/components/landing/use-cases"
import TechStack from "@/components/landing/tech-stack"
import Pricing from "@/components/landing/pricing"
import Testimonials from "@/components/landing/testimonials"
import Footer from "@/components/landing/footer"
import { SmoothScroll } from "@/components/ui/smooth-scroll"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

export default function Home() {
  return (
    <div className="min-h-screen">
      <SmoothScroll />
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <UseCases />
      <TechStack />
      <Pricing />
      <Testimonials />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
