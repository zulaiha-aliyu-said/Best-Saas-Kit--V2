'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles } from 'lucide-react';
import { LTDTierConfig } from '@/lib/ltd-tiers';

interface LTDPricingCardProps {
  tier: LTDTierConfig;
  onSelect?: (tier: number) => void;
  showEarlyBird?: boolean;
  disabled?: boolean;
  currentTier?: number;
}

export function LTDPricingCard({ 
  tier, 
  onSelect, 
  showEarlyBird = false,
  disabled = false,
  currentTier
}: LTDPricingCardProps) {
  const isCurrentTier = currentTier === tier.tier;
  const canUpgrade = currentTier ? tier.tier > currentTier : true;
  const price = showEarlyBird && tier.early_bird_price ? tier.early_bird_price : tier.price;
  const savings = tier.early_bird_price ? tier.price - tier.early_bird_price : 0;

  return (
    <Card className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentTier ? 'border-green-500' : ''}`}>
      {tier.popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            MOST POPULAR
          </Badge>
        </div>
      )}
      
      {isCurrentTier && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-600 text-white">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8 pt-6">
        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
        <CardDescription className="mt-2">{tier.best_for}</CardDescription>
        
        <div className="mt-4">
          {showEarlyBird && savings > 0 && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl text-muted-foreground line-through">${tier.price}</span>
              <Badge variant="destructive">Save ${savings}</Badge>
            </div>
          )}
          <div className="text-5xl font-bold">
            ${price}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            one-time payment
          </div>
          <div className="text-xs text-green-600 mt-1 font-semibold">
            Save {tier.savings_vs_subscription}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Credits */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-lg">
            <div className="text-3xl font-bold text-center">
              {tier.features.monthly_credits.toLocaleString()}
            </div>
            <div className="text-sm text-center text-muted-foreground">
              credits/month (lifetime)
            </div>
            <div className="text-xs text-center text-muted-foreground mt-1">
              Rollover for {tier.features.credit_rollover_months} months
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <FeatureItem 
              enabled={true} 
              text={`${tier.features.content_repurposing.platforms} platforms repurposing`} 
            />
            <FeatureItem 
              enabled={true} 
              text={`${typeof tier.features.content_repurposing.templates === 'number' ? tier.features.content_repurposing.templates : 'Unlimited'} templates`} 
            />
            <FeatureItem 
              enabled={tier.features.viral_hooks.enabled} 
              text="Viral hook generator" 
            />
            <FeatureItem 
              enabled={tier.features.scheduling.enabled} 
              text={tier.features.scheduling.enabled 
                ? `Schedule ${tier.features.scheduling.posts_per_month === 'unlimited' ? 'unlimited' : tier.features.scheduling.posts_per_month} posts/month`
                : 'Content scheduling'
              } 
            />
            <FeatureItem 
              enabled={tier.features.ai_chat.enabled} 
              text={tier.features.ai_chat.enabled
                ? `AI Chat (${tier.features.ai_chat.messages_per_month === 'unlimited' ? 'unlimited' : tier.features.ai_chat.messages_per_month + ' msg/mo'})`
                : 'AI chat assistant'
              } 
            />
            <FeatureItem 
              enabled={tier.features.predictive_performance.enabled} 
              text="Predictive performance AI" 
            />
            <FeatureItem 
              enabled={tier.features.style_training.enabled} 
              text={tier.features.style_training.enabled && tier.features.style_training.profiles
                ? `Style training (${tier.features.style_training.profiles} profile${tier.features.style_training.profiles > 1 ? 's' : ''})`
                : 'Style training'
              } 
            />
            
            {tier.features.bulk_generation && (
              <FeatureItem 
                enabled={tier.features.bulk_generation.enabled} 
                text="Bulk generation" 
              />
            )}
            
            {tier.features.team_collaboration && (
              <FeatureItem 
                enabled={tier.features.team_collaboration.enabled} 
                text={`Team (${tier.features.team_collaboration.team_members} members)`} 
              />
            )}
            
            {tier.features.api_access && (
              <FeatureItem 
                enabled={tier.features.api_access.enabled} 
                text={`API access (${tier.features.api_access.calls_per_month.toLocaleString()}/mo)`} 
              />
            )}

            <FeatureItem 
              enabled={true} 
              text={`${tier.features.analytics.history_days === 'unlimited' ? 'Unlimited' : tier.features.analytics.history_days + ' days'} analytics`} 
            />
            <FeatureItem 
              enabled={!tier.features.watermark} 
              text={tier.features.watermark ? 'Watermark on content' : 'No watermark'} 
            />
            <FeatureItem 
              enabled={true} 
              text={`${tier.features.processing_speed}x processing speed`} 
            />
            <FeatureItem 
              enabled={true} 
              text={getSupportText(tier.features.support_tier)} 
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => onSelect?.(tier.tier)}
          disabled={disabled || isCurrentTier || !canUpgrade}
          variant={tier.popular ? 'default' : 'outline'}
        >
          {isCurrentTier ? 'Current Plan' : canUpgrade ? 'Get Started' : 'Lower Tier'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeatureItem({ enabled, text }: { enabled: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2">
      {enabled ? (
        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      )}
      <span className={enabled ? 'text-foreground' : 'text-muted-foreground'}>
        {text}
      </span>
    </div>
  );
}

function getSupportText(tier: string): string {
  const supportMap: Record<string, string> = {
    community: 'Community support',
    priority_48hr: 'Priority email (48hr)',
    priority_24hr: 'Priority email (24hr)',
    priority_chat_4hr: 'Priority chat (4hr)',
  };
  
  return supportMap[tier] || 'Support included';
}







