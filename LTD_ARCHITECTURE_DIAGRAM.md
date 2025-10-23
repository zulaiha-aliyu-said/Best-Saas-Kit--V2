# 🏗️ LTD System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LTD PRICING SYSTEM                          │
│                    Production-Ready Architecture                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   API Layer  │────▶│   Database   │
│  Components  │     │   (Next.js)  │     │ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
   UI/UX Flow          Business Logic      Data & Features
```

---

## 🗄️ Database Layer

```
PostgreSQL Database
├── users (extended with LTD fields)
│   ├── plan_type: 'subscription' | 'ltd'
│   ├── ltd_tier: 1 | 2 | 3 | 4
│   ├── credits: current balance
│   ├── monthly_credit_limit: tier allocation
│   ├── rollover_credits: unused credits
│   ├── credit_reset_date: next reset
│   └── stacked_codes: number of codes redeemed
│
├── ltd_codes
│   ├── code: unique redemption code
│   ├── tier: 1-4
│   ├── is_redeemed: boolean
│   ├── redeemed_by: user_id
│   └── expires_at: expiration date
│
├── ltd_redemptions
│   ├── user_id: who redeemed
│   ├── code_id: which code
│   ├── tier: what tier
│   └── credits_added: how many
│
├── ltd_features
│   ├── tier: 1-4
│   ├── feature_key: feature name
│   ├── feature_value: JSONB config
│   └── enabled: boolean
│
└── credit_usage_log
    ├── user_id: who used
    ├── action_type: what action
    ├── credits_used: how many
    ├── credits_remaining: balance after
    └── metadata: JSONB details

Functions:
├── reset_monthly_credits()      → Auto credit reset
├── get_user_ltd_features()      → Fetch user features
└── log_credit_usage()           → Track usage

Views:
├── v_ltd_stats                  → Tier statistics
└── v_credit_usage_analytics     → Usage analytics
```

---

## 🔧 Backend Libraries

```
src/lib/
│
├── ltd-tiers.ts                 (611 lines)
│   ├── LTD_TIER_1 to LTD_TIER_4: Complete tier configs
│   ├── getLTDTierConfig(): Get tier details
│   ├── hasFeature(): Check feature availability
│   ├── getFeatureValue(): Get feature config
│   ├── calculateCreditCost(): Credit cost per action
│   ├── calculateStackedCredits(): Credits with stacking
│   └── CREDIT_COSTS: Cost reference for all actions
│
├── feature-gate.ts              (510 lines)
│   ├── getUserPlan(): Fetch user's current plan
│   ├── checkFeatureAccess(): Verify feature access
│   ├── checkCreditAccess(): Verify sufficient credits
│   ├── deductCredits(): Atomic credit deduction
│   ├── addCredits(): Add credits (refund/bonus)
│   ├── checkAndResetCredits(): Monthly reset logic
│   ├── getCreditUsageAnalytics(): Usage breakdown
│   ├── requireFeature(): Middleware for features
│   └── requireCredits(): Middleware for credits
│
└── ltd-database.ts              (387 lines)
    ├── createLTDCode(): Generate single code
    ├── createLTDCodeBatch(): Bulk code generation
    ├── getLTDCode(): Retrieve code details
    ├── validateLTDCode(): Check code validity
    ├── redeemLTDCode(): Redeem with tier logic
    ├── getUserRedemptions(): Redemption history
    ├── getLTDStatistics(): Admin stats
    └── getUsersByLTDTier(): Users per tier
```

---

## 🌐 API Endpoints

```
/api/ltd/
│
├── check-access/               (GET)
│   │   Query: ?feature=viral_hooks  OR  ?action=content_repurposing
│   │
│   └── Response:
│       {
│         "feature": "viral_hooks",
│         "access": {
│           "hasAccess": true/false,
│           "reason": "...",
│           "upgradeRequired": 2
│         }
│       }
│
├── features/                   (GET)
│   │
│   └── Response:
│       {
│         "plan": { type, tier, credits, ... },
│         "features": { /* all features */ },
│         "tierConfig": { /* tier details */ }
│       }
│
├── credits/                    (GET, POST)
│   │
│   ├── GET Response:
│   │   {
│   │     "credits": 750,
│   │     "monthly_limit": 750,
│   │     "rollover": 100,
│   │     "reset_date": "2025-11-22",
│   │     "percentage_used": 35
│   │   }
│   │
│   └── POST Body:
│       {
│         "action": "viral_hook",
│         "amount": 2,
│         "metadata": { ... }
│       }
│
└── usage-analytics/            (GET)
    │   Query: ?days=30
    │
    └── Response:
        {
          "usage_by_action": [...],
          "daily_trend": [...],
          "summary": { total_actions, total_credits_used, ... }
        }
```

---

## ⚛️ React Layer

```
Components (src/components/ltd/)
│
├── LTDPricingCard.tsx
│   │   Props: { tier, onSelect, showEarlyBird, currentTier }
│   │
│   └── Displays:
│       ├── Tier name and price
│       ├── Early bird discount
│       ├── Feature list with checkmarks
│       ├── Current tier badge
│       └── CTA button
│
├── LTDPricingSection.tsx
│   │   Props: { onSelectTier, currentTier }
│   │
│   └── Contains:
│       ├── All 4 pricing cards
│       ├── Early bird toggle
│       ├── Feature comparison table
│       ├── FAQ section
│       └── Info cards (stacking, rollover, updates)
│
├── CreditUsageWidget.tsx
│   │
│   └── Shows:
│       ├── Current credit balance
│       ├── Monthly limit progress bar
│       ├── Rollover credits
│       ├── Next reset date
│       └── Low credit warnings
│
└── CreditUsageAnalytics.tsx
    │
    └── Charts:
        ├── Daily usage trend (line chart)
        ├── Usage by action (bar chart)
        ├── Distribution (pie chart)
        └── Detailed action table

Hooks (src/hooks/)
│
├── useLTDFeatures()
│   ├── Returns: { plan, features, hasFeature(), checkFeatureAccess() }
│   └── Auto-refreshes on mount
│
└── useLTDCredits()
    ├── Returns: { credits, deductCredits(), refresh() }
    └── Real-time credit updates
```

---

## 📄 Pages

```
Dashboard Pages
│
├── /dashboard/ltd-pricing
│   │   Server Component
│   │
│   └── Renders:
│       └── <LTDPricingSection currentTier={userTier} />
│
└── /dashboard/credits
    │   Server Component
    │
    └── Layout:
        ├── <CreditUsageWidget />        (1/3 width)
        └── <CreditUsageAnalytics />     (2/3 width)
```

---

## 🔄 Data Flow

### Feature Check Flow
```
User Action
    │
    ▼
Component calls useLTDFeatures()
    │
    ▼
GET /api/ltd/features
    │
    ▼
getUserPlan() → Database Query
    │
    ▼
getLTDTierConfig(tier)
    │
    ▼
Return features to component
    │
    ▼
hasFeature('viral_hooks.enabled') → boolean
    │
    ├─ true  → Show Feature
    └─ false → Show Upgrade Prompt
```

### Credit Deduction Flow
```
User Performs Action
    │
    ▼
Component calls deductCredits()
    │
    ▼
POST /api/ltd/credits
    │
    ▼
checkCreditAccess(userId, action)
    │
    ├─ Insufficient → Return Error
    │
    ▼
BEGIN TRANSACTION
    │
    ├─ Lock user row (FOR UPDATE)
    ├─ Check credits >= amount
    ├─ UPDATE users SET credits = credits - amount
    ├─ INSERT INTO credit_usage_log
    │
    ▼
COMMIT TRANSACTION
    │
    ▼
Return { success: true, remaining: X }
    │
    ▼
Component updates UI
```

### Monthly Credit Reset Flow
```
Scheduled Job (or on user request)
    │
    ▼
checkAndResetCredits(userId)
    │
    ▼
Check if credit_reset_date <= NOW
    │
    ├─ No  → Return (no reset needed)
    │
    ▼
Calculate rollover:
    rollover = MIN(current_credits + old_rollover, monthly_limit)
    │
    ▼
UPDATE users SET
    credits = monthly_limit + rollover,
    rollover_credits = remaining,
    credit_reset_date = credit_reset_date + 1 month
    │
    ▼
Return success
```

---

## 🔐 Security Flow

### Server-Side Protection
```
API Route
    │
    ▼
getServerSession() → Verify authentication
    │
    ▼
requireFeature(userId, 'feature.path')
    │
    ├─ No access → Throw error → 403 response
    │
    ▼
requireCredits(userId, 'action', amount)
    │
    ├─ Insufficient → Throw error → 402 response
    │
    ▼
Deduct credits atomically
    │
    ▼
Execute business logic
    │
    ▼
Return success + remaining credits
```

### Client-Side UX
```
Component Mount
    │
    ▼
useLTDFeatures() → Fetch user features
    │
    ▼
hasFeature('feature.enabled')
    │
    ├─ false → Render upgrade prompt
    │
    ▼
Render feature UI
    │
    ▼
User clicks action
    │
    ▼
Check credits locally (UX only!)
    │
    ├─ Low → Show warning
    │
    ▼
Call API (server validates again!)
```

---

## 📊 Tier Feature Matrix

```
┌─────────────────────┬────────┬────────┬────────┬────────┐
│ Feature             │ Tier 1 │ Tier 2 │ Tier 3 │ Tier 4 │
├─────────────────────┼────────┼────────┼────────┼────────┤
│ Monthly Credits     │  100   │  300   │  750   │ 2,000  │
│ Content Repurposing │   ✓    │   ✓    │   ✓    │   ✓    │
│ Templates           │   15   │   40   │   60+  │   60+  │
│ Viral Hooks         │   ✗    │   ✓    │   ✓    │   ✓    │
│ Scheduling          │   ✗    │  30/mo │ 100/mo │  ∞     │
│ AI Chat             │   ✗    │   ✗    │ 200/mo │  ∞     │
│ Performance AI      │   ✗    │   ✗    │   ✓    │   ✓    │
│ Style Training      │   ✗    │   ✗    │ 1 prof │ 3 prof │
│ Team Collaboration  │   ✗    │   ✗    │   ✗    │   ✓    │
│ API Access          │   ✗    │   ✗    │   ✗    │   ✓    │
│ Watermark           │  Yes   │  Yes   │   No   │   No   │
│ Support             │  Comm  │ 48hr   │ 24hr   │  4hr   │
└─────────────────────┴────────┴────────┴────────┴────────┘
```

---

## 🎯 Integration Points

### Where to Use Feature Gating

```
API Routes:
✓ /api/viral-hooks         → requireFeature('viral_hooks.enabled')
✓ /api/schedule            → requireFeature('scheduling.enabled')
✓ /api/ai-chat             → requireFeature('ai_chat.enabled')
✓ /api/repurpose           → requireCredits('content_repurposing', 1)
✓ /api/predict             → requireCredits('performance_prediction', 1)

Components:
✓ <ViralHookButton />      → hasFeature('viral_hooks.enabled')
✓ <ScheduleModal />        → hasFeature('scheduling.enabled')
✓ <AIChatInterface />      → hasFeature('ai_chat.enabled')
✓ <StyleTraining />        → hasFeature('style_training.enabled')
✓ <TeamSettings />         → hasFeature('team_collaboration.enabled')
```

---

## 📈 Analytics Pipeline

```
User Action
    │
    ▼
deductCredits() called
    │
    ▼
Transaction begins
    │
    ├─ Deduct from users.credits
    │
    ├─ INSERT INTO credit_usage_log
    │   ├── user_id
    │   ├── action_type
    │   ├── credits_used
    │   ├── credits_remaining
    │   └── metadata (JSONB)
    │
    ▼
Transaction commits
    │
    ▼
Data available in:
    ├─ v_credit_usage_analytics (view)
    ├─ GET /api/ltd/usage-analytics
    └─ <CreditUsageAnalytics /> component
```

---

## 🚀 Deployment Architecture

```
Production Setup:
│
├── Database (PostgreSQL)
│   ├── Run: sql-queries/17-create-ltd-schema.sql
│   ├── Connection pooling enabled
│   └── SSL/TLS enforced
│
├── Backend (Next.js API)
│   ├── Environment: NODE_ENV=production
│   ├── Database URL configured
│   └── NextAuth configured
│
├── Frontend (React)
│   ├── Server-side rendering
│   ├── Client-side hydration
│   └── SWR for data fetching
│
└── Monitoring
    ├── Log all credit deductions
    ├── Alert on low credit patterns
    ├── Track tier distribution
    └── Monitor API performance
```

---

## 🎊 Complete System Map

```
DATABASE ──────────────┐
  ├─ users            │
  ├─ ltd_codes        │
  ├─ ltd_redemptions  │
  ├─ ltd_features     │
  └─ credit_usage_log │
                       │
LIBRARIES ─────────────┤
  ├─ ltd-tiers.ts     │──┐
  ├─ feature-gate.ts  │  │
  └─ ltd-database.ts  │  │
                       │  │
API ROUTES ────────────┤  │
  ├─ check-access     │  │
  ├─ features         │  │
  ├─ credits          │◄─┘
  └─ usage-analytics  │
                       │
HOOKS ─────────────────┤
  ├─ useLTDFeatures   │◄─┐
  └─ useLTDCredits    │  │
                       │  │
COMPONENTS ────────────┤  │
  ├─ LTDPricingCard   │  │
  ├─ LTDPricingSection│  │
  ├─ CreditUsageWidget│──┘
  └─ CreditAnalytics  │
                       │
PAGES ─────────────────┤
  ├─ /ltd-pricing     │
  └─ /credits         │
                       │
DOCS ──────────────────┘
  ├─ START_HERE_LTD.md
  ├─ LTD_IMPLEMENTATION_COMPLETE.md
  ├─ LTD_QUICK_START.md
  └─ LTD_FEATURE_GATING_EXAMPLES.md
```

---

**🎉 Complete System - Ready for Production! 🚀**







