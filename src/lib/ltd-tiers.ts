/**
 * LTD (Lifetime Deal) Pricing Tiers Configuration
 * Based on AppSumo pricing structure
 */

export type LTDTier = 1 | 2 | 3 | 4;
export type PlanType = 'subscription' | 'ltd';
export type SubscriptionStatus = 'free' | 'starter' | 'pro' | 'enterprise' | 'ltd_tier_1' | 'ltd_tier_2' | 'ltd_tier_3' | 'ltd_tier_4';

export interface LTDFeatures {
  // Credits
  monthly_credits: number;
  credit_rollover_months: number;
  
  // Content Repurposing
  content_repurposing: {
    platforms: number;
    input_methods: string[];
    templates: number | 'unlimited';
    custom_templates?: number | 'unlimited';
  };
  
  // Trending Topics
  trending_topics: {
    enabled: boolean;
    hashtags: number | 'unlimited';
    sources: string[];
    alerts?: 'weekly' | 'daily';
    competitor_tracking?: boolean;
  };
  
  // Analytics
  analytics: {
    history_days: number | 'unlimited';
    export: boolean;
    formats?: string[];
    competitor_benchmarking?: boolean;
    team_dashboard?: boolean;
  };
  
  // Content History
  content_history_days: number | 'unlimited';
  
  // Viral Hooks
  viral_hooks: {
    enabled: boolean;
    patterns?: number;
    cost_credits?: number;
    ab_testing?: boolean;
  };
  
  // Scheduling
  scheduling: {
    enabled: boolean;
    posts_per_month?: number | 'unlimited';
    cost_credits?: number;
    bulk?: boolean;
    auto_posting?: boolean;
    smart_suggestions?: boolean;
  };
  
  // AI Chat
  ai_chat: {
    enabled: boolean;
    messages_per_month?: number | 'unlimited';
    model?: string | string[];
    models?: string[];
    cost_credits?: number;
    custom_prompts?: boolean;
  };
  
  // Predictive Performance
  predictive_performance: {
    enabled: boolean;
    cost_credits?: number;
    optimization_tips?: boolean;
  };
  
  // Style Training
  style_training: {
    enabled: boolean;
    profiles?: number;
    cost_credits?: number;
    team_sharing?: boolean;
  };
  
  // Bulk Generation
  bulk_generation?: {
    enabled: boolean;
    max_pieces: number | 'unlimited';
    cost_credits: number;
  };
  
  // Team Features
  team_collaboration?: {
    enabled: boolean;
    team_members: number;
    role_based_permissions: boolean;
  };
  
  // API Access
  api_access?: {
    enabled: boolean;
    calls_per_month: number;
  };
  
  // White Label
  white_label?: {
    enabled: boolean;
    remove_branding: boolean;
  };
  
  // Performance & Support
  processing_speed: number;
  watermark: boolean;
  support_tier: 'community' | 'priority_48hr' | 'priority_24hr' | 'priority_chat_4hr';
  early_access?: boolean;
  dedicated_manager?: boolean;
}

export interface LTDTierConfig {
  tier: LTDTier;
  name: string;
  price: number;
  early_bird_price?: number;
  description: string;
  best_for: string;
  features: LTDFeatures;
  popular?: boolean;
  savings_vs_subscription: string;
}

// Tier 1: Solo Creators ($59)
export const LTD_TIER_1: LTDTierConfig = {
  tier: 1,
  name: 'License Tier 1',
  price: 59,
  early_bird_price: 49,
  description: 'Perfect for solo creators, bloggers, and small businesses',
  best_for: 'Solo creators, bloggers, small business owners',
  savings_vs_subscription: '$289/year',
  features: {
    monthly_credits: 100,
    credit_rollover_months: 12,
    content_repurposing: {
      platforms: 4,
      input_methods: ['text', 'url', 'youtube'],
      templates: 15,
    },
    trending_topics: {
      enabled: true,
      hashtags: 10,
      sources: ['reddit', 'news'],
    },
    analytics: {
      history_days: 30,
      export: false,
    },
    content_history_days: 90,
    viral_hooks: {
      enabled: false,
    },
    scheduling: {
      enabled: false,
    },
    ai_chat: {
      enabled: false,
    },
    predictive_performance: {
      enabled: false,
    },
    style_training: {
      enabled: false,
    },
    processing_speed: 1,
    watermark: true,
    support_tier: 'community',
  },
};

// Tier 2: Content Marketers ($139)
export const LTD_TIER_2: LTDTierConfig = {
  tier: 2,
  name: 'License Tier 2',
  price: 139,
  early_bird_price: 119,
  description: 'Ideal for content marketers, freelancers, and small agencies',
  best_for: 'Content marketers, freelancers, small agencies',
  savings_vs_subscription: '$557 (2 years)',
  features: {
    monthly_credits: 300,
    credit_rollover_months: 12,
    content_repurposing: {
      platforms: 4,
      input_methods: ['text', 'url', 'youtube'],
      templates: 40,
      custom_templates: 5,
    },
    trending_topics: {
      enabled: true,
      hashtags: 'unlimited',
      sources: ['reddit', 'news', 'google', 'youtube'],
      alerts: 'weekly',
    },
    analytics: {
      history_days: 180,
      export: true,
      formats: ['pdf', 'excel'],
    },
    content_history_days: 180,
    viral_hooks: {
      enabled: true,
      patterns: 50,
      cost_credits: 2,
    },
    scheduling: {
      enabled: true,
      posts_per_month: 30,
      cost_credits: 0.5,
    },
    ai_chat: {
      enabled: false,
    },
    predictive_performance: {
      enabled: false,
    },
    style_training: {
      enabled: false,
    },
    processing_speed: 2,
    watermark: true,
    support_tier: 'priority_48hr',
  },
};

// Tier 3: Agencies & Power Users ($249) - MOST POPULAR
export const LTD_TIER_3: LTDTierConfig = {
  tier: 3,
  name: 'License Tier 3',
  price: 249,
  early_bird_price: 219,
  description: 'Perfect for agencies, marketing teams, and power users',
  best_for: 'Agencies, marketing teams, power users',
  savings_vs_subscription: '$939/year',
  popular: true,
  features: {
    monthly_credits: 750,
    credit_rollover_months: 12,
    content_repurposing: {
      platforms: 4,
      input_methods: ['text', 'url', 'youtube'],
      templates: 60,
      custom_templates: 'unlimited',
    },
    trending_topics: {
      enabled: true,
      hashtags: 'unlimited',
      sources: ['reddit', 'news', 'google', 'youtube'],
      alerts: 'weekly',
      competitor_tracking: true,
    },
    analytics: {
      history_days: 'unlimited',
      export: true,
      formats: ['pdf', 'excel', 'csv'],
      competitor_benchmarking: true,
    },
    content_history_days: 'unlimited',
    viral_hooks: {
      enabled: true,
      patterns: 50,
      cost_credits: 2,
    },
    scheduling: {
      enabled: true,
      posts_per_month: 100,
      cost_credits: 0.5,
      bulk: true,
    },
    ai_chat: {
      enabled: true,
      messages_per_month: 200,
      model: 'qwen3-235b',
      cost_credits: 0.5,
    },
    predictive_performance: {
      enabled: true,
      cost_credits: 1,
      optimization_tips: true,
    },
    style_training: {
      enabled: true,
      profiles: 1,
      cost_credits: 5,
    },
    bulk_generation: {
      enabled: true,
      max_pieces: 5,
      cost_credits: 0.9,
    },
    processing_speed: 3,
    watermark: false,
    support_tier: 'priority_24hr',
    early_access: true,
  },
};

// Tier 4: Enterprise ($449)
export const LTD_TIER_4: LTDTierConfig = {
  tier: 4,
  name: 'License Tier 4',
  price: 449,
  early_bird_price: 399,
  description: 'Enterprise solution for large agencies and teams',
  best_for: 'Large agencies, enterprise teams',
  savings_vs_subscription: '$1,927 (2 years)',
  features: {
    monthly_credits: 2000,
    credit_rollover_months: 12,
    content_repurposing: {
      platforms: 4,
      input_methods: ['text', 'url', 'youtube'],
      templates: 60,
      custom_templates: 'unlimited',
    },
    trending_topics: {
      enabled: true,
      hashtags: 'unlimited',
      sources: ['reddit', 'news', 'google', 'youtube'],
      alerts: 'daily',
      competitor_tracking: true,
    },
    analytics: {
      history_days: 'unlimited',
      export: true,
      formats: ['pdf', 'excel', 'csv'],
      competitor_benchmarking: true,
      team_dashboard: true,
    },
    content_history_days: 'unlimited',
    viral_hooks: {
      enabled: true,
      patterns: 50,
      cost_credits: 2,
      ab_testing: true,
    },
    scheduling: {
      enabled: true,
      posts_per_month: 'unlimited',
      cost_credits: 0.5,
      bulk: true,
      auto_posting: true,
      smart_suggestions: true,
    },
    ai_chat: {
      enabled: true,
      messages_per_month: 'unlimited',
      models: ['gpt-4o', 'claude', 'qwen'],
      cost_credits: 0.3,
      custom_prompts: true,
    },
    predictive_performance: {
      enabled: true,
      cost_credits: 1,
      optimization_tips: true,
    },
    style_training: {
      enabled: true,
      profiles: 3,
      cost_credits: 5,
      team_sharing: true,
    },
    bulk_generation: {
      enabled: true,
      max_pieces: 'unlimited',
      cost_credits: 0.8,
    },
    team_collaboration: {
      enabled: true,
      team_members: 3,
      role_based_permissions: true,
    },
    api_access: {
      enabled: true,
      calls_per_month: 2500,
    },
    white_label: {
      enabled: true,
      remove_branding: true,
    },
    processing_speed: 5,
    watermark: false,
    support_tier: 'priority_chat_4hr',
    early_access: true,
    dedicated_manager: true,
  },
};

// All tiers in an array for easy iteration
export const LTD_TIERS: LTDTierConfig[] = [
  LTD_TIER_1,
  LTD_TIER_2,
  LTD_TIER_3,
  LTD_TIER_4,
];

// Helper function to get tier config
export function getLTDTierConfig(tier: LTDTier): LTDTierConfig {
  const config = LTD_TIERS.find(t => t.tier === tier);
  if (!config) {
    throw new Error(`Invalid LTD tier: ${tier}`);
  }
  return config;
}

// Helper function to check if a feature is enabled for a tier
export function hasFeature(tier: LTDTier, featurePath: string): boolean {
  const config = getLTDTierConfig(tier);
  const parts = featurePath.split('.');
  let current: any = config.features;
  
  for (const part of parts) {
    if (current === undefined || current === null) return false;
    current = current[part];
  }
  
  if (typeof current === 'object' && current !== null && 'enabled' in current) {
    return current.enabled === true;
  }
  
  return current !== false && current !== undefined && current !== null;
}

// Helper function to get feature value
export function getFeatureValue<T = any>(tier: LTDTier, featurePath: string): T | null {
  const config = getLTDTierConfig(tier);
  const parts = featurePath.split('.');
  let current: any = config.features;
  
  for (const part of parts) {
    if (current === undefined || current === null) return null;
    current = current[part];
  }
  
  return current as T;
}

// Credit cost calculation based on action and tier
export interface CreditCost {
  action: string;
  base_cost: number;
  tier_multipliers?: Partial<Record<LTDTier, number>>;
}

export const CREDIT_COSTS: Record<string, CreditCost> = {
  content_repurposing: {
    action: 'Content Repurposing (per platform)',
    base_cost: 1,
  },
  viral_hook: {
    action: 'Viral Hook Generation',
    base_cost: 2,
  },
  trend_content: {
    action: 'Trend-Based Content',
    base_cost: 1,
  },
  schedule_post: {
    action: 'Schedule Post',
    base_cost: 0.5,
  },
  performance_prediction: {
    action: 'AI Performance Prediction',
    base_cost: 1,
  },
  ai_chat_conversation: {
    action: 'AI Chat (per 2 messages)',
    base_cost: 0.5,
    tier_multipliers: {
      3: 0.5,
      4: 0.3,
    },
  },
  style_training: {
    action: 'Style Training Session',
    base_cost: 5,
  },
  bulk_generation: {
    action: 'Bulk Generation (per piece)',
    base_cost: 0.9,
    tier_multipliers: {
      4: 0.8,
    },
  },
};

// Calculate credit cost for an action
export function calculateCreditCost(action: string, tier?: LTDTier): number {
  const costConfig = CREDIT_COSTS[action];
  if (!costConfig) return 0;
  
  if (tier && costConfig.tier_multipliers && costConfig.tier_multipliers[tier] !== undefined) {
    return costConfig.tier_multipliers[tier]!;
  }
  
  return costConfig.base_cost;
}

// Code stacking calculation
export function calculateStackedCredits(tier: LTDTier, codes: number): number {
  const config = getLTDTierConfig(tier);
  return config.features.monthly_credits * codes;
}

// Helper to get subscription status from tier
export function getSubscriptionStatusFromTier(tier: LTDTier): SubscriptionStatus {
  return `ltd_tier_${tier}` as SubscriptionStatus;
}

// Helper to get tier from subscription status
export function getTierFromSubscriptionStatus(status: SubscriptionStatus): LTDTier | null {
  const match = status.match(/^ltd_tier_(\d+)$/);
  if (!match) return null;
  const tier = parseInt(match[1], 10);
  if (tier >= 1 && tier <= 4) return tier as LTDTier;
  return null;
}

// Feature comparison for pricing page
export interface FeatureComparison {
  feature: string;
  tier1: string | boolean;
  tier2: string | boolean;
  tier3: string | boolean;
  tier4: string | boolean;
}

export const FEATURE_COMPARISON_TABLE: FeatureComparison[] = [
  {
    feature: 'Monthly Credits',
    tier1: '100',
    tier2: '300',
    tier3: '750',
    tier4: '2,000',
  },
  {
    feature: 'Content Repurposing',
    tier1: '✅ 4 platforms',
    tier2: '✅ 4 platforms',
    tier3: '✅ 4 platforms',
    tier4: '✅ 4 platforms',
  },
  {
    feature: 'Premium Templates',
    tier1: '15',
    tier2: '40 + 5 custom',
    tier3: '60 + unlimited custom',
    tier4: '60 + unlimited custom',
  },
  {
    feature: 'Viral Hook Generator',
    tier1: false,
    tier2: '✅ 50+ patterns',
    tier3: '✅ 50+ patterns',
    tier4: '✅ 50+ patterns + A/B',
  },
  {
    feature: 'Content Scheduling',
    tier1: false,
    tier2: '✅ 30/month',
    tier3: '✅ 100/month',
    tier4: '✅ Unlimited',
  },
  {
    feature: 'AI Chat Assistant',
    tier1: false,
    tier2: false,
    tier3: '✅ 200 msg/month',
    tier4: '✅ Unlimited',
  },
  {
    feature: 'Predictive Performance',
    tier1: false,
    tier2: false,
    tier3: '✅ Included',
    tier4: '✅ Included',
  },
  {
    feature: 'Style Training',
    tier1: false,
    tier2: false,
    tier3: '✅ 1 profile',
    tier4: '✅ 3 profiles',
  },
  {
    feature: 'Team Collaboration',
    tier1: false,
    tier2: false,
    tier3: false,
    tier4: '✅ 3 members',
  },
  {
    feature: 'API Access',
    tier1: false,
    tier2: false,
    tier3: false,
    tier4: '✅ 2,500/month',
  },
  {
    feature: 'Analytics History',
    tier1: '30 days',
    tier2: '6 months',
    tier3: 'Unlimited',
    tier4: 'Unlimited',
  },
  {
    feature: 'Processing Speed',
    tier1: '1x',
    tier2: '2x',
    tier3: '3x',
    tier4: '5x',
  },
  {
    feature: 'Watermark',
    tier1: 'Yes',
    tier2: 'Yes',
    tier3: 'No',
    tier4: 'No',
  },
  {
    feature: 'Support',
    tier1: 'Community',
    tier2: 'Email 48hr',
    tier3: 'Email 24hr',
    tier4: 'Chat 4hr',
  },
];







