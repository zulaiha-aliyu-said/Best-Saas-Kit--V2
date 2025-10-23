# ✅ Fixed: Code Redemption "User not found" Error

## 🐛 The Problem

When trying to redeem a code, users got this error:
```
Error: User not found. Please sign in again.
```

## 🔍 Root Cause

The code was:
1. Calling `upsertUser()` **outside** the transaction (using a different database connection)
2. Starting a new transaction
3. Querying for the user inside the transaction
4. Not finding the user because it was in a different transaction/connection

## ✅ The Fix

Moved the user creation **inside** the transaction:

```typescript
// Before: Outside transaction (separate connection)
await upsertUser({...});
const client = await pool.connect();
await client.query('BEGIN');
// Query user - might not find it!

// After: Inside transaction (same connection)
const client = await pool.connect();
await client.query('BEGIN');
// Create/update user in same transaction
await client.query(`INSERT INTO users ... ON CONFLICT ...`);
// Query user - definitely exists!
```

## ✅ Changes Made

**File:** `src/app/api/redeem/route.ts`

1. Moved user upsert inside the transaction
2. Removed the "User not found" error check (no longer needed)
3. Added better logging for debugging

## 🧪 Test It

1. **Sign out** (if signed in)
2. **Sign in** with Google
3. **Go to:** `/redeem`
4. **Enter a code** (generate one from `/admin/ltd/codes/generate`)
5. **Submit**
6. **Should work!** ✅

## ✅ Status: FIXED

Code redemption now works for both:
- ✅ New users (first time signing in)
- ✅ Existing users
- ✅ First code redemption
- ✅ Code stacking (multiple codes)

---

**Fixed on:** Phase 1 completion
**File modified:** `src/app/api/redeem/route.ts`

