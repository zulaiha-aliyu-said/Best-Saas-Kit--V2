# 🚀 LTD Pricing System - Quick Start Guide

## 5-Minute Setup

### Step 1: Run Database Migration
```bash
# Connect to your database
psql $DATABASE_URL

# Run the LTD schema
\i sql-queries/17-create-ltd-schema.sql
```

You should see:
```
✅ LTD PRICING SYSTEM INSTALLED
- Tier 1: 100 credits/month
- Tier 2: 300 credits/month  
- Tier 3: 750 credits/month (POPULAR)
- Tier 4: 2000 credits/month
```

### Step 2: Test the API
```bash
# In your browser or API client
GET http://localhost:3000/api/ltd/features
```

### Step 3: View the Pricing Page
```bash
# Navigate to:
http://localhost:3000/dashboard/ltd-pricing
```

---

## Quick Feature Check

### Check if a user has access to a feature:
```typescript
import { checkFeatureAccess } from '@/lib/feature-gate';

const access = await checkFeatureAccess(userId, 'viral_hooks.enabled');

if (!access.hasAccess) {
  console.log(`Upgrade required: Tier ${access.upgradeRequired}`);
}
```

### Deduct credits when user performs an action:
```typescript
import { deductCredits } from '@/lib/feature-gate';

const result = await deductCredits(
  userId, 
  1, // amount
  'content_repurposing',
  { platform: 'twitter' } // optional metadata
);

console.log(`Credits remaining: ${result.remaining}`);
```

---

## The 4 Tiers at a Glance

| Tier | Price | Credits | Key Features |
|------|-------|---------|--------------|
| **1** | $59 | 100/mo | Basic repurposing, 15 templates |
| **2** | $139 | 300/mo | + Viral hooks, scheduling (30/mo) |
| **3** | $249 | 750/mo | + AI chat, predictions, style training ⭐ |
| **4** | $449 | 2000/mo | + Team, API, unlimited chat |

---

## Protect Features in Your Code

### In an API Route:
```typescript
import { requireFeature, requireCredits } from '@/lib/feature-gate';

export async function POST(request: NextRequest) {
  const userId = getUserIdFromSession();
  
  // Throws error if user doesn't have access
  await requireFeature(userId, 'viral_hooks.enabled');
  
  // Deducts credits automatically
  const remaining = await requireCredits(userId, 'viral_hook');
  
  // Continue with your logic...
}
```

### In a React Component:
```typescript
'use client';

export function FeatureButton() {
  const { data } = useSWR('/api/ltd/features');
  
  if (!data?.features?.viral_hooks?.enabled) {
    return <UpgradePrompt tier={2} />;
  }
  
  return <Button>Use Feature</Button>;
}
```

---

## Generate Test Codes (Optional)

```typescript
import { createLTDCodeBatch } from '@/lib/ltd-database';

// Generate 10 Tier 1 codes
const codes = await createLTDCodeBatch(1, 10, 'TEST');

console.log(codes.map(c => c.code));
// ['TEST-1-XXXXXXXXXXXX', 'TEST-1-YYYYYYYYYYYY', ...]
```

---

## Common Tasks

### Get User's Current Plan:
```typescript
import { getUserPlan } from '@/lib/feature-gate';

const plan = await getUserPlan(userId);
console.log(`Tier: ${plan.ltd_tier}, Credits: ${plan.credits}`);
```

### Check Credits:
```typescript
import { checkCreditAccess } from '@/lib/feature-gate';

const access = await checkCreditAccess(userId, 'content_repurposing');
console.log(`Can afford: ${access.hasAccess}, Cost: ${access.limit}`);
```

### View Usage Analytics:
```typescript
// In browser:
fetch('/api/ltd/usage-analytics?days=30')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## UI Components

### Show Pricing:
```tsx
import { LTDPricingSection } from '@/components/ltd/LTDPricingSection';

<LTDPricingSection 
  onSelectTier={(tier) => console.log(`Selected tier ${tier}`)}
  currentTier={userTier}
/>
```

### Show Credits:
```tsx
import { CreditUsageWidget } from '@/components/ltd/CreditUsageWidget';

<CreditUsageWidget />
```

### Show Analytics:
```tsx
import { CreditUsageAnalytics } from '@/components/ltd/CreditUsageAnalytics';

<CreditUsageAnalytics />
```

---

## Testing

### Test Feature Access:
```sql
-- Set user to Tier 1
UPDATE users SET plan_type = 'ltd', ltd_tier = 1, monthly_credit_limit = 100, credits = 100 WHERE id = 1;

-- Check what they can access
SELECT * FROM get_user_ltd_features(1);
```

### Test Credit Deduction:
```typescript
const result = await deductCredits(1, 5, 'test_action');
// Check: user credits should decrease by 5
```

### Manual Credit Reset (for testing):
```sql
-- Trigger monthly reset
SELECT reset_monthly_credits();
```

---

## Need Help?

📖 **Full Documentation**: `LTD_IMPLEMENTATION_COMPLETE.md`  
🎯 **Tier Configs**: `src/lib/ltd-tiers.ts`  
🔧 **Feature Gating**: `src/lib/feature-gate.ts`  
💾 **Database Schema**: `sql-queries/17-create-ltd-schema.sql`

---

**You're all set! 🎉**

The LTD system is ready to use. Start protecting features and tracking credits!







