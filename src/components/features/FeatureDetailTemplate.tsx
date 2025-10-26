import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LucideIcon } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  color?: string;
}

interface FeatureDetailTemplateProps {
  // Hero Section
  badge: string;
  badgeColor?: string;
  title: string;
  description: string;
  heroIcon: LucideIcon;
  heroGradient: string;
  ctaPrimary: string;
  ctaPrimaryLink: string;
  
  // Benefits Section
  benefits: Benefit[];
  benefitsTitle?: string;
  benefitsSubtitle?: string;
  
  // How It Works Section
  howItWorks: HowItWorksStep[];
  howItWorksTitle?: string;
  howItWorksSubtitle?: string;
  
  // Features List
  features: string[];
  featuresTitle?: string;
  featuresSubtitle?: string;
  
  // Optional: Use Cases
  useCases?: { title: string; description: string; }[];
  
  // Optional: Additional Content Section
  additionalContent?: React.ReactNode;
  
  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
}

export function FeatureDetailTemplate({
  badge,
  badgeColor = "bg-purple-600",
  title,
  description,
  heroIcon: HeroIcon,
  heroGradient,
  ctaPrimary,
  ctaPrimaryLink,
  benefits,
  benefitsTitle = "Key Benefits",
  benefitsSubtitle = "Why this feature matters",
  howItWorks,
  howItWorksTitle = "How It Works",
  howItWorksSubtitle = "Get started in simple steps",
  features,
  featuresTitle = "Complete Feature Set",
  featuresSubtitle = "Everything you need",
  useCases,
  additionalContent,
  ctaTitle,
  ctaDescription,
}: FeatureDetailTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/40 via-muted/30 to-background py-20 px-4">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <Link href="/features" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 group">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Features
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-border">
                {badge}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                {title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href={ctaPrimaryLink}>
                    {ctaPrimary}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 hover:bg-muted/50 transition-all" asChild>
                  <Link href="/auth/signin">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card backdrop-blur-lg rounded-3xl p-8 border-2 border-border shadow-2xl">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center shadow-lg">
                    <HeroIcon className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-muted/50 text-primary border-border mb-4">
              {benefitsTitle}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              {benefitsSubtitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-muted/50 text-primary border-border mb-4">
              {howItWorksTitle}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              {howItWorksSubtitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-card rounded-2xl p-6 border-2 border-border hover:border-primary/30 hover:shadow-xl transition-all h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Content */}
      {additionalContent && (
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto">
            {additionalContent}
          </div>
        </section>
      )}

      {/* Features List */}
      <section className={`py-20 px-4 ${additionalContent ? 'bg-muted/30' : 'bg-gradient-to-b from-muted/20 to-background'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-muted/50 text-primary border-border mb-4">
              {featuresTitle}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              {featuresSubtitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-card rounded-xl p-4 border hover:border-primary/30 hover:shadow-md transition-all">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      {useCases && useCases.length > 0 && (
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-muted/50 text-primary border-border mb-4">
                Use Cases
              </Badge>
              <h2 className="text-4xl font-bold mb-4">
                Perfect For Everyone
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, idx) => (
                <Card key={idx} className="border-2 hover:border-primary/30 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <CardTitle className="text-lg">{useCase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-2xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold">
            {ctaTitle}
          </h2>
          <p className="text-xl text-muted-foreground">
            {ctaDescription}
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all" asChild>
              <Link href={ctaPrimaryLink}>
                {ctaPrimary}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all" asChild>
              <Link href="/features">
                Explore More Features
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

