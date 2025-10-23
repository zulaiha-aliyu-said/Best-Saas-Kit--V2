# 🔧 Edge Runtime Fix - "crypto module not supported" Error

## ❌ Problem

Users were getting this error when trying to use the app:
```
Error: The edge runtime does not support Node.js 'crypto' module.
```

**Root Cause:**
- NextAuth runs in **Edge Runtime** (via middleware)
- I added a `signIn` callback that calls `upsertUser()` from `@/lib/database`
- `@/lib/database` uses `pg` (PostgreSQL client)
- `pg` requires Node.js's `crypto` module
- Edge Runtime doesn't support Node.js `crypto` ❌

---

## ✅ Solution

### Changed Approach: Auto-Create Users in API Endpoints

Instead of creating users in the auth callback (Edge Runtime), we now create them automatically in API endpoints (Node.js Runtime).

---

## 📁 Files Modified

### 1. **Reverted `src/lib/auth.ts`**
Removed the `signIn` callback that tried to access the database:

```typescript
// ❌ REMOVED (was causing Edge Runtime error)
async signIn({ user, account, profile }) {
  await upsertUser({ ... }); // Can't call database in Edge Runtime!
}
```

### 2. **Created `src/lib/ensure-user.ts`** ✨ NEW
Helper function to auto-create users in API routes:

```typescript
export async function ensureUserExists() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized', status: 401 };
  }

  // Check if user exists
  let user = await getUserByGoogleId(session.user.id);
  
  // If not, create them
  if (!user) {
    console.log('🆕 Creating new user:', session.user.email);
    user = await upsertUser({
      google_id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || null,
      image_url: session.user.image || null,
    });
    console.log('✅ User created successfully');
  }
  
  return { success: true, user, session };
}
```

### 3. **Updated `src/app/api/repurpose/route.ts`**
Now auto-creates users when they generate content:

```typescript
export async function POST(req: NextRequest) {
  try {
    // Ensure user exists (auto-creates if needed)
    const { ensureUserExists } = await import('@/lib/ensure-user');
    const userResult = await ensureUserExists();
    
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status }
      );
    }
    
    const { user, session } = userResult;
    // ... rest of the endpoint
  }
}
```

### 4. **Updated `src/app/api/ai/generate-improved-content/route.ts`**
Same pattern for viral hooks endpoint.

---

## 🎯 How It Works Now

### User Flow:

#### First Time Using the App:
1. ✅ User signs in with Google OAuth
2. ✅ NextAuth authenticates (no database access)
3. ✅ Session is created
4. ✅ User navigates to `/dashboard/repurpose`
5. ✅ User generates content
6. ✅ API endpoint calls `ensureUserExists()`
7. ✅ **User is auto-created** with defaults:
   - `id`: Google ID
   - `plan_type`: 'subscription'
   - `credits`: 25
   - `monthly_credit_limit`: 25
   - `ltd_tier`: null (free tier)
8. ✅ Content generation succeeds!

#### Subsequent Requests:
1. ✅ User makes API request
2. ✅ `ensureUserExists()` finds existing user
3. ✅ Returns user immediately (no database insert)
4. ✅ Request proceeds normally

---

## 🚀 Benefits

1. ✅ **No Edge Runtime errors** - Database access only in Node.js API routes
2. ✅ **Automatic user creation** - Users created on first API call
3. ✅ **No user interaction needed** - Completely transparent
4. ✅ **Efficient** - Only creates user once, then reuses
5. ✅ **Type-safe** - TypeScript ensures correct data

---

## 🧪 Testing

### Test the Fix:
```
1. Refresh your browser
2. Go to /dashboard/repurpose
3. Select platforms
4. Generate content
5. ✅ Should work without Edge Runtime error!
```

### Expected Terminal Output:
```
🆕 Creating new user: your-email@gmail.com
✅ User created successfully: your-email@gmail.com
💳 Credit calculation: 3 platforms × 1 credits = 3 total credits
✅ Deducted 3 credits. Remaining: 22
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BEFORE (Broken)                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  User Signs In                                            │
│       ↓                                                   │
│  NextAuth Middleware (Edge Runtime) ❌                   │
│       ↓                                                   │
│  signIn callback → upsertUser() → pg → crypto           │
│                                            ↑              │
│                              ERROR! Not available in Edge│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     AFTER (Fixed)                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  User Signs In                                            │
│       ↓                                                   │
│  NextAuth Middleware (Edge Runtime) ✅                   │
│  (No database access)                                     │
│       ↓                                                   │
│  User Makes API Request                                   │
│       ↓                                                   │
│  API Route (Node.js Runtime) ✅                          │
│       ↓                                                   │
│  ensureUserExists() → upsertUser() → pg → crypto ✅     │
│  (Works! Node.js runtime supports crypto)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

1. **Edge Runtime** is for middleware and has limited Node.js API support
2. **Node.js Runtime** is for API routes and has full Node.js API support
3. **Database operations** should always happen in Node.js Runtime
4. **Auth callbacks** run in Edge Runtime, so no database access there
5. **Lazy user creation** is a valid pattern for modern apps

---

## 📝 Summary

| Before | After |
|--------|-------|
| ❌ User creation in auth callback (Edge) | ✅ User creation in API routes (Node.js) |
| ❌ Edge Runtime error with `crypto` | ✅ No runtime errors |
| ❌ Users can't generate content | ✅ Users auto-created on first use |
| ❌ Complex auth setup | ✅ Simple, transparent auto-creation |

---

**The app should now work without the Edge Runtime error!** 🎉

**Last Updated:** ${new Date().toISOString()}





