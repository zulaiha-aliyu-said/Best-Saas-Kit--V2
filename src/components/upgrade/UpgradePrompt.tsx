"use client"

import { Crown, Sparkles, Check, ArrowRight, Lock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface UpgradePromptProps {
  featureName: string
  currentTier: number
  requiredTier: number
  benefits?: string[]
  onClose?: () => void
  variant?: "modal" | "inline" | "banner"
}

export function UpgradePrompt({
  featureName,
  currentTier,
  requiredTier,
  benefits,
  onClose,
  variant = "inline"
}: UpgradePromptProps) {
  const tierNames = {
    1: "Starter",
    2: "Pro",
    3: "Premium",
    4: "Enterprise"
  }

  const tierColors = {
    1: "from-gray-500 to-gray-600",
    2: "from-blue-500 to-blue-600",
    3: "from-purple-500 to-purple-600",
    4: "from-amber-500 to-amber-600"
  }

  const defaultBenefits = {
    2: [
      "50+ Viral Hook Patterns",
      "Content Scheduling (30/month)",
      "300 Credits/Month",
      "40+ Premium Templates",
      "2x Faster Processing"
    ],
    3: [
      "AI Performance Predictions",
      "AI Chat Assistant (200 msgs/month)",
      "Advanced Scheduling (100/month)",
      "750 Credits/Month",
      "60+ Templates + Unlimited Custom",
      "No Watermarks"
    ],
    4: [
      "Team Collaboration (3 members)",
      "Unlimited AI Chat & Scheduling",
      "API Access (2,500 calls/month)",
      "2,000 Credits/Month",
      "White-label Options",
      "Dedicated Account Manager"
    ]
  }

  const tierBenefits = benefits || defaultBenefits[requiredTier as keyof typeof defaultBenefits] || []

  const tierPrices = {
    2: "$139",
    3: "$249",
    4: "$449"
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{featureName} is a Tier {requiredTier}+ Feature</h3>
                <Badge className={`bg-gradient-to-r ${tierColors[requiredTier as keyof typeof tierColors]} text-white border-0`}>
                  {tierNames[requiredTier as keyof typeof tierNames]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                You're currently on Tier {currentTier}. Upgrade to unlock this feature and more!
              </p>
            </div>
          </div>
          <Link href="/redeem">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Upgrade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className={`bg-gradient-to-r ${tierColors[requiredTier as keyof typeof tierColors]} text-white rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Unlock {featureName}</CardTitle>
                  <CardDescription className="text-white/90">
                    Upgrade to Tier {requiredTier} ({tierNames[requiredTier as keyof typeof tierNames]}) to access this feature
                  </CardDescription>
                </div>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Current vs Required */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Your Current Tier</p>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Tier {currentTier}
                  </Badge>
                </div>
                <div className="px-4">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Required Tier</p>
                  <Badge className={`bg-gradient-to-r ${tierColors[requiredTier as keyof typeof tierColors]} text-white border-0 text-lg px-4 py-2`}>
                    Tier {requiredTier}
                  </Badge>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  What You'll Unlock
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tierBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">One-time payment</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {tierPrices[requiredTier as keyof typeof tierPrices]}
                      <span className="text-sm font-normal text-gray-600 ml-2">lifetime access</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Save {requiredTier === 2 ? "$557" : requiredTier === 3 ? "$939" : "$1,927"} vs annual pricing
                    </p>
                  </div>
                  <Link href="/redeem">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Upgrade Now
                      <Crown className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground">
                <p>💡 <strong>Pro Tip:</strong> Stack codes to keep your current tier and add more credits!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Inline variant (default)
  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${tierColors[requiredTier as keyof typeof tierColors]} text-white`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl">{featureName} - Tier {requiredTier}+ Feature</CardTitle>
            <CardDescription className="text-white/90">
              Upgrade from Tier {currentTier} to unlock this premium feature
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Benefits */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Unlock These Benefits:
            </h3>
            <div className="space-y-2">
              {tierBenefits.slice(0, 4).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
              <p className="text-2xl font-bold">
                {tierPrices[requiredTier as keyof typeof tierPrices]}
                <span className="text-sm font-normal text-muted-foreground ml-1">lifetime</span>
              </p>
            </div>
            <Link href="/redeem">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Upgrade to Tier {requiredTier}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

