
# Free Trial System

## Overview
New users start with a **free trial** that gives them limited access to test the platform before purchasing an LTD code.

## Free Trial Details

### Credits
- **10 credits** (one-time, no renewal)
- **1 credit per platform** when repurposing content
- Example: Repurposing to 4 platforms = 4 credits

### Feature Access
Free trial users can **ONLY** access:
- ✅ **Content Repurposing** - Convert content to multiple platforms
  - All 4 platforms supported (X/Twitter, LinkedIn, Instagram, Email)
  - URL and text input methods
  - All tone and length options

### Features NOT Available in Free Trial
Free trial users **CANNOT** access:
- ❌ Trending Topics
- ❌ Analytics
- ❌ Viral Hooks
- ❌ Scheduling
- ❌ AI Chat
- ❌ Performance Predictions
- ❌ Style Training
- ❌ Bulk Generation

## After Free Trial

When users exhaust their 10 free credits, they will see:
> "Free trial credits exhausted. Please redeem an LTD code to continue using the app with full access."

### To Continue Using the App
Users must **redeem an LTD code** to:
1. Get monthly credits based on their tier (100-2000 credits/month)
2. Unlock all features based on their tier
3. Get monthly credit renewals with rollover support

## LTD Tiers (AppSumo Lifetime Deals)

### Tier 1 ($59) - 100 credits/month
- All repurpose features
- Trending topics
- Basic analytics
- 90-day content history

### Tier 2 ($139) - 300 credits/month
- Everything in Tier 1
- Viral hooks
- Scheduling (30 posts/month)
- 180-day content history
- Priority support

### Tier 3 ($249) - 750 credits/month ⭐ MOST POPULAR
- Everything in Tier 2
- AI Chat (200 messages/month)
- Performance predictions
- Style training (1 profile)
- Bulk generation
- Unlimited content history
- No watermark

### Tier 4 ($449) - 2000 credits/month
- Everything in Tier 3
- Unlimited AI chat
- 3 style profiles
- Team collaboration (3 members)
- API access (2500 calls/month)
- White label
- Dedicated manager
- Priority chat support

## Implementation Details

### Database Schema
```sql
-- Free Trial User
credits: 10
plan_type: 'subscription'
subscription_status: 'free'
monthly_credit_limit: 10
rollover_credits: 0
stacked_codes: 0
credit_reset_date: NULL

-- LTD User (e.g., Tier 3)
credits: 750
plan_type: 'ltd'
subscription_status: 'ltd_tier_3'
monthly_credit_limit: 750
rollover_credits: 0
stacked_codes: 1
credit_reset_date: TIMESTAMP (next month)
```

### Feature Gating
The `feature-gate.ts` module handles all feature access:
- `checkFeatureAccess()` - Checks if user can access a feature
- `deductCredits()` - Deducts credits and shows appropriate errors
- `getUserPlan()` - Gets user's current plan and credit status

### Code Redemption
Users redeem codes at `/redeem` page:
1. Enter LTD code (e.g., APPSUMO-XXXXX)
2. System validates code and tier
3. User upgraded to LTD plan with monthly credits
4. All features unlocked based on tier

## Credit Usage

### Cost per Action
- **Content Repurposing**: 1 credit per platform
  - 4 platforms selected = 4 credits
  - 2 platforms selected = 2 credits
- **Viral Hooks**: 2 credits
- **Scheduling**: 0.5 credits per post
- **AI Chat**: 0.5 credits per message (Tier 3), 0.3 (Tier 4)
- **Style Training**: 5 credits to create profile
- **Performance Predictions**: 1 credit

### Credit Rollover
- LTD users can rollover unused credits to next month
- Maximum rollover: up to monthly limit
- Free trial credits do NOT rollover (one-time only)

## Testing the System

### Create Test Free Trial User
1. Sign up with new Google account
2. Should automatically receive 10 credits
3. Can only access `/dashboard/repurpose`
4. Other features show "requires LTD plan" message

### Create Test LTD User
1. Sign up with new account (gets 10 trial credits)
2. Go to `/redeem` page
3. Enter test LTD code
4. Upgraded to LTD tier with monthly credits
5. All tier features unlocked

## Migration Guide

### Updating Existing Users
Run this SQL script to update existing users:
```bash
psql DATABASE_URL < sql-queries/19-fix-existing-users.sql
```

This will:
- Set free trial users to 10 credits
- Keep LTD users' credits unchanged
- Set proper feature access flags

## User Journey

```
New User Signs Up
       ↓
Gets 10 Trial Credits
       ↓
Tests Repurpose Feature
       ↓
Uses ~2-3 generations (8-12 credits)
       ↓
Runs Out of Credits
       ↓
Sees: "Redeem LTD Code"
       ↓
Goes to /redeem
       ↓
Enters AppSumo Code
       ↓
Upgraded to LTD Tier
       ↓
Gets Monthly Credits
       ↓
Full Feature Access!
```

## Error Messages

### Free Trial Exhausted
```
Free trial credits exhausted. Please redeem an LTD code to continue using the app with full access.
```

### Feature Not Available
```
Feature requires an LTD plan. Please redeem a code to continue.
```

### LTD User Exhausted
```
Insufficient credits. Required: 4, Available: 2
```

## Support

### Common Questions

**Q: Can I get more free trial credits?**
A: No, free trial is one-time only. Redeem an LTD code for monthly credits.

**Q: What happens when I redeem a code?**
A: Your account is upgraded to LTD with monthly credits that renew automatically.

**Q: Can I stack multiple codes?**
A: Yes! Each additional code of same tier adds credits. Different tiers upgrade you.

**Q: Do credits expire?**
A: LTD credits reset monthly with rollover support. Trial credits don't renew.

**Q: Can I downgrade after redeeming?**
A: No, LTD codes are lifetime. Once redeemed, you keep that tier forever.













