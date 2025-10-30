# 🔧 Repurpose New User Credit Issue Fix

## ❌ Problem

New registered users are getting `402 Payment Required` error when repurposing content:

**Terminal Log:**
```
🗄️  database.ts - getUserPreferences
  userId: 104799763406502560000
  rows found: 0
  ⚠️  No preferences found, returning defaults
💳 Credit calculation: 4 platforms × 1 credits = 4 total credits
⏭️  Platform optimization is disabled
POST /api/repurpose 402 in 7982ms
```

**Console Error:**
```
Failed to load resource: the server responded with a status of 402 (Payment Required)
```

## 🔍 Root Cause

Two possible scenarios:

### Scenario 1: User Has Exhausted Free Trial Credits
- New users get 10 free trial credits
- Each platform costs 1 credit (4 platforms = 4 credits)
- User may have already used their credits
- Better error messaging needed

### Scenario 2: User Not Getting Initial Credits
- User was created but didn't receive initial 10 credits
- Database insert issue or conflict handling problem

## ✅ Solution

### Fix 1: SQL Script to Reset Free Trial Users
Run `fix-new-user-credits.sql` to:
1. Check the specific user's credit balance
2. Reset them to 10 credits if they're below
3. Fix all other free trial users with same issue

### Fix 2: Improve Error Messaging
Update the repurpose page to show clearer error messages:
- Show current credit balance
- Show credits required vs available
- Guide users to redeem LTD code

### Fix 3: Add Credit Check Before Generation
Add pre-flight credit check to prevent wasted API calls

## 📝 Steps to Fix

### Step 1: Run SQL Script
Execute `fix-new-user-credits.sql` in your Neon database to reset users.

### Step 2: Update Frontend Error Display
The repurpose page should show:
```
❌ Insufficient Credits
You need 4 credits but only have X credits remaining.
Free trial: 10 credits (one-time)
→ Redeem an LTD code to get 100-2000 monthly credits
```

### Step 3: Verify User Creation
Ensure `upsertUser` function always gives 10 credits to new users.

## 🎯 Expected Behavior

**Free Trial Users:**
- Start with 10 credits
- 1 credit per platform for repurposing
- Clear messaging when credits run out
- Easy path to upgrade via LTD code

**LTD Users:**
- 100-2000 credits/month (based on tier)
- Monthly renewal with rollover
- No credit exhaustion issues


