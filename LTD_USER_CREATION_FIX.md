# 🔧 User Creation Fix - "User not found" Error

## ❌ Problem

Users were getting "Generation Error: User not found" because:
1. NextAuth was authenticating users via Google OAuth
2. But users weren't being created in the database
3. API endpoints couldn't find the user when trying to deduct credits

## ✅ Solution

### 1. Added `signIn` Callback to NextAuth
**File:** `src/lib/auth.ts`

Now automatically creates/updates users in the database when they sign in:

```typescript
async signIn({ user, account, profile }) {
  // Create or update user in database when they sign in
  if (account?.provider === 'google' && profile) {
    await upsertUser({
      google_id: profile.sub || user.id,
      email: profile.email || user.email || '',
      name: profile.name || user.name || null,
      image_url: profile.picture || user.image || null,
    });
  }
  return true;
}
```

### 2. Fixed `User` Interface Type
**File:** `src/lib/database.ts`

Changed `id` from `number` to `string` to match VARCHAR(255) database schema:

```typescript
export interface User {
  id: string  // Was: id: number
  google_id: string
  // ... rest of fields
}
```

### 3. Updated `upsertUser` Function
**File:** `src/lib/database.ts`

Now explicitly sets `id = google_id` since we changed to VARCHAR:

```typescript
INSERT INTO users (id, google_id, email, name, image_url, last_login)
VALUES ($1, $1, $2, $3, $4, CURRENT_TIMESTAMP)  // $1 used for both id and google_id
ON CONFLICT (id)  // Conflict on primary key
DO UPDATE SET ...
```

### 4. Optimized `getUserByGoogleId`
**File:** `src/lib/database.ts`

Query by `id` (primary key) instead of `google_id` for better performance:

```typescript
const query = 'SELECT * FROM users WHERE id = $1'  // Was: google_id = $1
```

---

## 🎯 What Happens Now

### User Sign-In Flow:
1. ✅ User clicks "Sign in with Google"
2. ✅ Google OAuth authenticates
3. ✅ `signIn` callback triggers
4. ✅ `upsertUser` creates/updates user in database
5. ✅ User gets default LTD settings:
   - `plan_type`: 'subscription'
   - `credits`: 25 (or database default)
   - `monthly_credit_limit`: 25
   - `ltd_tier`: null (free tier)
6. ✅ User can now use the app!

### When User Generates Content:
1. ✅ `getUserByGoogleId(session.user.id)` finds the user
2. ✅ `getUserPlan(session.user.id)` gets their LTD plan
3. ✅ `calculateCreditCost()` determines cost
4. ✅ `deductCredits()` deducts and logs usage
5. ✅ Content generation succeeds!

---

## 🧪 Testing

### Step 1: Sign Out and Sign Back In
```
1. Sign out of your account
2. Sign in again with Google
3. Check terminal - you should see:
   ✅ User upserted successfully: your-email@gmail.com
```

### Step 2: Test Content Generation
```
1. Go to /dashboard/repurpose
2. Select platforms (e.g., Twitter, LinkedIn, Instagram = 3 credits)
3. Generate content
4. Should work without "User not found" error
5. Check /dashboard/credits - usage should be logged
```

### Step 3: Verify Database
```sql
-- Check if user was created
SELECT id, google_id, email, plan_type, credits, monthly_credit_limit 
FROM users 
WHERE email = 'your-email@gmail.com';

-- Should show:
-- id: your-google-id (long string)
-- google_id: same as id
-- plan_type: subscription
-- credits: 25 (or whatever default)
-- monthly_credit_limit: 25
```

---

## 📊 Default User Settings

New users get these defaults (from database schema):

| Field | Default Value |
|-------|--------------|
| `plan_type` | 'subscription' |
| `ltd_tier` | NULL (free tier) |
| `credits` | 25 |
| `monthly_credit_limit` | 25 |
| `rollover_credits` | 0 |
| `stacked_codes` | 1 |
| `subscription_status` | 'free' |

---

## 🎉 Benefits

1. ✅ **Automatic user creation** - no manual setup needed
2. ✅ **Type-safe** - TypeScript interfaces match database
3. ✅ **Efficient queries** - using primary key index
4. ✅ **LTD ready** - users start with proper defaults
5. ✅ **Error-free** - no more "User not found" errors

---

## 📝 Files Modified

1. `src/lib/auth.ts` - Added `signIn` callback
2. `src/lib/database.ts` - Fixed types and queries:
   - User interface: `id: string`
   - `upsertUser`: sets id = google_id
   - `getUserByGoogleId`: queries by id (primary key)

---

**Last Updated:** ${new Date().toISOString()}





