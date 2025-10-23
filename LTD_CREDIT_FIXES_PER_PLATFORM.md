# 💳 LTD Credit System Fixes - Per-Platform Deduction

## ✅ Fixed Issues

### 1. **Viral Hook Generation - Now Using LTD Credit System**
**File:** `src/app/api/ai/generate-improved-content/route.ts`

**Before:** Used old database credit system (`@/lib/database`)
**After:** Now uses LTD credit system with proper logging

**Changes:**
- ✅ Imports LTD credit functions: `deductCredits`, `getUserPlan`, `calculateCreditCost`
- ✅ Calculates tier-specific credit cost (Tier 1: 2 credits, Tier 2+: discounted)
- ✅ Logs credit usage to `credit_usage_log` table
- ✅ Returns `creditsUsed` and remaining `credits` in response

**Credit Cost:**
```typescript
- Tier 1: 2 credits per viral hook
- Tier 2+: May have discounts based on tier
```

---

### 2. **Content Repurposing - Credits Per Platform**
**File:** `src/app/api/repurpose/route.ts`

**Before:** Deducted 1 credit total, regardless of platforms selected
**After:** Deducts 1 credit PER PLATFORM

**Changes:**
- ✅ Calculates: `totalCreditCost = numPlatforms × creditCostPerPlatform`
- ✅ Logs detailed metadata: platforms, numPlatforms, sourceType, tone, contentLength
- ✅ Returns `creditsUsed` and remaining `credits` in response
- ✅ Shows clear credit calculation in console logs

**Examples:**
```typescript
// User selects 3 platforms: Twitter, LinkedIn, Instagram
numPlatforms = 3
creditCostPerPlatform = 1 (Tier 1)
totalCreditCost = 3 credits

// User selects 1 platform: Email only
numPlatforms = 1
creditCostPerPlatform = 1 (Tier 1)
totalCreditCost = 1 credit

// User selects 4 platforms: All platforms
numPlatforms = 4
creditCostPerPlatform = 1 (Tier 1)
totalCreditCost = 4 credits
```

**Console Logs:**
```
💳 Credit calculation: 3 platforms × 1 credits = 3 total credits
✅ Deducted 3 credits. Remaining: 747
```

---

## 🔍 Credit Logging

Both endpoints now properly log to the `credit_usage_log` table with:

- ✅ `user_id`: The user's ID
- ✅ `action_type`: `'viral_hook'` or `'repurpose'`
- ✅ `credits_used`: The amount deducted
- ✅ `credits_remaining`: Balance after deduction
- ✅ `metadata`: Detailed context (platforms, tone, settings, etc.)
- ✅ `created_at`: Timestamp

---

## 📊 Credit Usage Analytics

The credits page (`/dashboard/credits`) will now show:

### **Viral Hook Usage:**
- Action: "Viral Hook"
- Credits per use: 2 (Tier 1)
- Total usage tracked

### **Repurpose Usage:**
- Action: "Repurpose"
- Credits per use: Varies by number of platforms (1-4)
- Metadata shows which platforms were selected

---

## 🧪 Testing

### Test Viral Hook:
1. Go to any content with low performance score
2. Click "Generate Improvements"
3. Check console: Should see credit deduction
4. Check `/dashboard/credits`: Should show "Viral Hook" action

### Test Repurpose (Per Platform):
1. Go to `/dashboard/repurpose`
2. Select **3 platforms** (e.g., Twitter, LinkedIn, Instagram)
3. Generate content
4. **Expected:** 3 credits deducted (1 per platform)
5. Check `/dashboard/credits`: Should show "Repurpose" with 3 credits

---

## 💡 How It Works

### Credit Calculation Flow:

```typescript
// 1. Get user's LTD plan
const plan = await getUserPlan(session.user.id);

// 2. Calculate cost based on action and tier
const creditCost = calculateCreditCost('repurpose', plan?.ltd_tier);
// or for multiple platforms:
const totalCreditCost = creditCostPerPlatform × numPlatforms;

// 3. Deduct credits with full logging
const creditResult = await deductCredits(
  userId,
  totalCreditCost,
  'repurpose',
  { platforms, numPlatforms, ... }
);

// 4. Check success
if (!creditResult.success) {
  return error with remaining balance
}

// 5. Return updated balance
return { credits: creditResult.remaining, creditsUsed: totalCreditCost }
```

---

## 🎯 Expected Behavior

### Before Fix:
- ❌ Viral hooks: Used wrong credit system, no logging
- ❌ Repurpose: Always deducted 1 credit, even for 4 platforms
- ❌ Credits page: Didn't show accurate usage

### After Fix:
- ✅ Viral hooks: Properly deducts 2 credits (Tier 1) with logging
- ✅ Repurpose: Deducts 1 credit per platform selected
- ✅ Credits page: Shows all actions with correct amounts
- ✅ Metadata: Tracks which platforms, tone, settings used

---

## 📈 Credit Usage Examples

### Tier 1 User (100 credits/month):

**Scenario 1: Generate 10 viral hooks**
- Cost: 10 × 2 = **20 credits**
- Remaining: 80 credits

**Scenario 2: Repurpose to 3 platforms, 5 times**
- Cost: 5 × 3 = **15 credits**
- Remaining: 85 credits

**Scenario 3: Mix of both**
- 5 viral hooks: 5 × 2 = 10 credits
- 10 repurpose (4 platforms each): 10 × 4 = 40 credits
- Total: **50 credits used**
- Remaining: 50 credits

---

## ✅ Summary

Both critical credit deduction issues are now fixed:

1. ✅ **Viral hooks** properly use LTD credit system with logging
2. ✅ **Repurpose** deducts credits per platform, not per generation
3. ✅ **Credit logs** are accurate and detailed
4. ✅ **Credits page** shows real-time usage

Users will now see accurate credit deductions that match the number of platforms they select!

---

**Last Updated:** ${new Date().toISOString()}
**Files Modified:**
- `src/app/api/ai/generate-improved-content/route.ts`
- `src/app/api/repurpose/route.ts`





